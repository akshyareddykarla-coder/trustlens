import dns from 'dns/promises';
import { URL } from 'url';

/**
 * Checks if an IPv4 or IPv6 address is private, loopback, link-local, or reserved.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  // Normalize IPv6 mapped IPv4 addresses (e.g. ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Loopbacks
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0' || ip === 'localhost') {
    return true;
  }

  // IPv4 regex check
  const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) return true;
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) return true;
    // 127.0.0.0/8
    if (octet1 === 127) return true;
    // 169.254.0.0/16 (Link Local / Cloud Metadata)
    if (octet1 === 169 && octet2 === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;
    // 0.0.0.0/8
    if (octet1 === 0) return true;
    // Broadcast / Multicast
    if (octet1 >= 224) return true;

    return false;
  }

  // IPv6 checks
  const lowerIp = ip.toLowerCase();
  if (
    lowerIp.startsWith('fc') ||
    lowerIp.startsWith('fd') ||
    lowerIp.startsWith('fe80') ||
    lowerIp === '::1' ||
    lowerIp === '::'
  ) {
    return true;
  }

  return false;
}

/**
 * Validates a target URL against SSRF attacks:
 * - Protocol must be http: or https:
 * - Domain name cannot resolve to private/reserved IPs
 * - Disallows credentials in URL
 */
export async function validateUrlForSsrf(inputUrl: string): Promise<{ valid: boolean; error?: string; url?: URL }> {
  try {
    const parsedUrl = new URL(inputUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
    }

    if (parsedUrl.username || parsedUrl.password) {
      return { valid: false, error: 'URLs with embedded credentials are not allowed.' };
    }

    const hostname = parsedUrl.hostname;

    // Check direct IP or localhost
    if (isPrivateOrReservedIP(hostname)) {
      return { valid: false, error: 'Access to private or local host addresses is strictly forbidden.' };
    }

    // Resolve DNS to verify destination IP
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      if (!addresses || addresses.length === 0) {
        return { valid: false, error: 'Hostname could not be resolved.' };
      }

      for (const record of addresses) {
        if (isPrivateOrReservedIP(record.address)) {
          return {
            valid: false,
            error: `Target resolved to restricted network address (${record.address}). Request blocked by SSRF policy.`,
          };
        }
      }
    } catch (dnsErr: any) {
      return { valid: false, error: `DNS resolution failed: ${dnsErr.message}` };
    }

    return { valid: true, url: parsedUrl };
  } catch (err: any) {
    return { valid: false, error: `Malformed URL: ${err.message}` };
  }
}
