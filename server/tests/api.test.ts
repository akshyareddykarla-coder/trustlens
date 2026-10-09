import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('TrustLens API Integration Tests', () => {
  it('GET /api/health returns operational status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('TrustLens API');
  });

  it('GET /api/v1/reporting-resources returns seeded citizen channels', async () => {
    const res = await request(app).get('/api/v1/reporting-resources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.resources)).toBe(true);
    expect(res.body.resources.length).toBeGreaterThan(0);
    const pib = res.body.resources.find((r: any) => r.title.includes('PIB'));
    expect(pib).toBeDefined();
    expect(pib.official_url).toContain('pib.gov.in');
  });

  it('GET /api/v1/education/lessons returns structured lessons', async () => {
    const res = await request(app).get('/api/v1/education/lessons');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.lessons)).toBe(true);
    expect(res.body.lessons.length).toBeGreaterThanOrEqual(3);
  });

  it('POST /api/v1/analyses executes verification pipeline on submitted claim', async () => {
    const payload = {
      inputType: 'text',
      content: 'Breaking: PIB issues warning against fraudulent railway vacancy notice requiring Rs 5000 fee.',
      language: 'en',
    };

    const res = await request(app).post('/api/v1/analyses').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.riskScore).toBeDefined();
    expect(res.body.riskLevel).toBeDefined();
    expect(Array.isArray(res.body.indicators)).toBe(true);
    expect(Array.isArray(res.body.evidenceSources)).toBe(true);
    expect(res.body.evidenceSources.length).toBeGreaterThan(0);
  });
});
