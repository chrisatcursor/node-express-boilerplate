const request = require('supertest');
const httpStatus = require('http-status');
const express = require('express');
const app = require('../../src/app');
const config = require('../../src/config/config');
const { version } = require('../../package.json');
const docsRoute = require('../../src/routes/v1/docs.route');

describe('Auth routes', () => {
  describe('GET /api/health', () => {
    test('should return health payload with safe metadata', async () => {
      const res = await request(app).get('/api/health').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        ok: true,
        version,
        uptimeSeconds: expect.any(Number),
      });
      expect(Number.isInteger(res.body.uptimeSeconds)).toBe(true);
      expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).not.toHaveProperty('secret');
      expect(res.body).not.toHaveProperty('credentials');
      expect(res.body).not.toHaveProperty('bucket');
    });
  });

  describe('GET /v1/docs/health-toolbar.js', () => {
    test('should return toolbar script that consumes /api/health', async () => {
      const docsApp = express();
      docsApp.use('/v1/docs', docsRoute);

      const res = await request(docsApp).get('/v1/docs/health-toolbar.js').send().expect(httpStatus.OK);

      expect(res.type).toMatch(/javascript/);
      expect(res.text).toContain("const endpoint = '/api/health';");
      expect(res.text).toContain('Live status from /api/health');
    });
  });

  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      config.env = 'production';
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
      config.env = process.env.NODE_ENV;
    });
  });
});
