const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const config = require('../../src/config/config');

describe('Auth routes', () => {
  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      config.env = 'production';
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
      config.env = process.env.NODE_ENV;
    });
  });
});

describe('Observability routes', () => {
  describe('GET /api/health', () => {
    test('should return health payload with safe observability fields', async () => {
      const res = await request(app).get('/api/health').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        status: 'ok',
        service: 'backend',
        version: expect.any(String),
        buildId: expect.any(String),
        uptimeMs: expect.any(Number),
        observedAt: expect.any(String),
        metrics: {
          requests: {
            total: expect.any(Number),
            byMethod: expect.any(Object),
            byStatusClass: expect.any(Object),
          },
          lastError: {
            class: expect.anything(),
            observedAt: expect.anything(),
          },
          checks: {
            filesystem: {
              filesystemProbeHealthy: expect.any(Boolean),
              checksRun: expect.any(Number),
            },
            commands: {
              commandCheckPassed: expect.any(Boolean),
              checksRun: expect.any(Number),
            },
          },
        },
      });

      expect(Object.keys(res.body)).not.toEqual(
        expect.arrayContaining(['stack', 'env', 'tokens', 'jwt', 'email', 'mongoose'])
      );
      expect(JSON.stringify(res.body)).not.toContain('JWT_SECRET');
      expect(JSON.stringify(res.body)).not.toContain('SMTP_PASSWORD');
      expect(JSON.stringify(res.body)).not.toContain('mongodb://');
    });

    test('should include an error class without exposing stack traces', async () => {
      await request(app).get('/missing-route').send().expect(httpStatus.NOT_FOUND);

      const res = await request(app).get('/api/health').send().expect(httpStatus.OK);
      expect(res.body.metrics.lastError.class).toBe('ApiError');
      expect(JSON.stringify(res.body)).not.toContain('stack');
    });
  });

  describe('GET /api/metrics', () => {
    test('should return metrics-only payload with request counters', async () => {
      const res = await request(app).get('/api/metrics').send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        requests: {
          total: expect.any(Number),
          byMethod: expect.any(Object),
          byStatusClass: expect.any(Object),
        },
        lastError: {
          class: expect.anything(),
          observedAt: expect.anything(),
        },
        checks: {
          filesystem: {
            filesystemProbeHealthy: expect.any(Boolean),
            checksRun: expect.any(Number),
          },
          commands: {
            commandCheckPassed: expect.any(Boolean),
            checksRun: expect.any(Number),
          },
        },
      });
    });
  });

  describe('GET /api/health/desktop', () => {
    test('should return desktop observability page', async () => {
      const res = await request(app).get('/api/health/desktop').send().expect(httpStatus.OK);
      expect(res.text).toContain('Backend observability');
      expect(res.text).toContain('/api/health/desktop/app.js');
    });
  });
});
