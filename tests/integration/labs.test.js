const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Labs routes', () => {
  describe('GET /v1/labs/feature-flags', () => {
    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/labs/feature-flags').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 and feature flags for a signed in user', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/labs/feature-flags')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        title: 'Labs',
        navigation: {
          label: 'Labs',
          badge: 'new',
          after: 'Administration',
        },
        featureFlags: expect.any(Array),
      });
      expect(res.body.featureFlags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'labsPage',
            name: 'Labs page',
            enabled: true,
            isNew: true,
          }),
        ])
      );
    });

    test('should return 200 and feature flags for a signed in admin', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/labs/feature-flags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });
});
