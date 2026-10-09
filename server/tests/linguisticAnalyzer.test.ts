import { describe, it, expect } from 'vitest';
import { analyzeLinguisticSignals, detectLanguage } from '../src/services/linguisticAnalyzer.js';

describe('Linguistic Analyzer Service', () => {
  it('correctly detects languages based on script', () => {
    expect(detectLanguage('Breaking news regarding economic survey report')).toBe('en');
    expect(detectLanguage('ఈ సందేశాన్ని వెంటనే ప్రతి గ్రూపుకు షేర్ చేయండి')).toBe('te');
    expect(detectLanguage('यह चौंकाने वाला सच तुरंत सभी को शेयर करें')).toBe('hi');
  });

  it('detects urgency signals and increases risk score in English', () => {
    const text = 'Forward to everyone immediately before tomorrow midnight deadline! Urgent alert!';
    const result = analyzeLinguisticSignals(text);

    expect(result.indicators.some((i) => i.name === 'Urgency & Forwarding Pressure')).toBe(true);
    expect(result.riskScore).toBeGreaterThanOrEqual(40);
  });

  it('classifies messages with compound urgency, sensationalism, and all-caps as elevated risk', () => {
    const text = 'SHOCKING BOMBSHELL: DANGEROUS SECRET EXPOSED! Forward to everyone immediately before tomorrow midnight!';
    const result = analyzeLinguisticSignals(text);

    expect(result.riskLevel).toBe('elevated_risk');
    expect(result.riskScore).toBeGreaterThan(60);
  });

  it('detects urgency signals in Telugu', () => {
    const text = 'ఈ సమాచారాన్ని వెంటనే ప్రతి గ్రూపుకు షేర్ చేయండి డిలీట్ కాకముందే';
    const result = analyzeLinguisticSignals(text);

    expect(result.detectedLanguage).toBe('te');
    expect(result.indicators.some((i) => i.name === 'Urgency & Forwarding Pressure')).toBe(true);
  });

  it('detects sensationalism and fear in Hindi', () => {
    const text = 'बड़ा खुलासा! यह भयानक जहर आपके स्वास्थ्य को बर्बाद कर देगा। तुरंत शेयर करें।';
    const result = analyzeLinguisticSignals(text);

    expect(result.detectedLanguage).toBe('hi');
    expect(result.indicators.some((i) => i.name.includes('Sensational'))).toBe(true);
    expect(result.indicators.some((i) => i.name.includes('Alarmist'))).toBe(true);
  });

  it('assigns lower risk signals to formal attributed statements', () => {
    const text = 'According to the official press release from the Department of Space, the rocket conducted a sub-orbital test flight at Chitradurga.';
    const result = analyzeLinguisticSignals(text);

    expect(result.riskLevel).toBe('lower_risk');
    expect(result.indicators.some((i) => i.name === 'Formal Attribution Context')).toBe(true);
  });
});
