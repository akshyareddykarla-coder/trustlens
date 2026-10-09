import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIP, validateUrlForSsrf } from '../src/services/ssrfGuard.js';

describe('SSRF Guard Service', () => {
  it('blocks localhost and loopback IPv4/IPv6', () => {
    expect(isPrivateOrReservedIP('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('localhost')).toBe(true);
    expect(isPrivateOrReservedIP('::1')).toBe(true);
  });

  it('blocks private subnets (10.x, 192.168.x, 172.16.x)', () => {
    expect(isPrivateOrReservedIP('10.0.0.5')).toBe(true);
    expect(isPrivateOrReservedIP('192.168.1.100')).toBe(true);
    expect(isPrivateOrReservedIP('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('169.254.169.254')).toBe(true); // AWS/cloud metadata
  });

  it('allows public Internet IP addresses', () => {
    expect(isPrivateOrReservedIP('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIP('1.1.1.1')).toBe(false);
  });

  it('rejects invalid or unsafe URL schemes', async () => {
    const fileResult = await validateUrlForSsrf('file:///etc/passwd');
    expect(fileResult.valid).toBe(false);

    const ftpResult = await validateUrlForSsrf('ftp://example.com/file');
    expect(ftpResult.valid).toBe(false);

    const loopbackResult = await validateUrlForSsrf('http://127.0.0.1:8080/secret');
    expect(loopbackResult.valid).toBe(false);
  });
});
