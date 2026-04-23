const request = require('supertest');
const httpStatus = require('http-status');
const express = require('express');
const app = require('../../src/app');
const docsRoute = require('../../src/routes/v1/docs.route');
const config = require('../../src/config/config');

describe('Auth routes', () => {
  describe('GET /v1/docs', () => {
    test('should return docs page with custom header title and favicon', async () => {
      const docsApp = express();
      docsApp.use('/v1/docs', docsRoute);

      const docsResponse = await request(docsApp).get('/v1/docs/').send().expect(httpStatus.OK);
      expect(docsResponse.text).toContain('<title>Node Express Boilerplate API documentation</title>');
      expect(docsResponse.text).toContain('rel="icon"');
      expect(docsResponse.text).toContain('data:image/svg+xml');
    });

    test('should return 404 when running in production', async () => {
      config.env = 'production';
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
      config.env = process.env.NODE_ENV;
    });
  });
});
