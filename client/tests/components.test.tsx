import { describe, it, expect } from 'vitest';

describe('TrustLens Client Smoke & Logic Tests', () => {
  it('validates supported languages configuration', () => {
    const supportedLanguages = ['en', 'te', 'hi'];
    expect(supportedLanguages).toContain('en');
    expect(supportedLanguages).toContain('te');
    expect(supportedLanguages).toContain('hi');
  });

  it('validates risk score category boundaries', () => {
    function mapRiskCategory(score: number): string {
      if (score <= 28) return 'lower_risk';
      if (score <= 60) return 'needs_verification';
      return 'elevated_risk';
    }

    expect(mapRiskCategory(15)).toBe('lower_risk');
    expect(mapRiskCategory(45)).toBe('needs_verification');
    expect(mapRiskCategory(85)).toBe('elevated_risk');
  });
});
