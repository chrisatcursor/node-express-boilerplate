const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { insertUsers, admin, userOne } = require('../fixtures/user.fixture');
const { adminAccessToken, userOneAccessToken } = require('../fixtures/token.fixture');
const { insertTickets } = require('../fixtures/ticket.fixture');

setupTestDB();

describe('Insights routes', () => {
  describe('GET /v1/insights/reports', () => {
    test('should return 401 when access token is missing', async () => {
      await request(app).get('/v1/insights/reports').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 for non-admin users', async () => {
      await insertUsers([userOne]);

      await request(app)
        .get('/v1/insights/reports')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return chart-ready aggregates for admins', async () => {
      await insertUsers([admin]);
      await insertTickets([
        { title: 'Ticket 1', status: 'open', priority: 'high', category: 'bug' },
        { title: 'Ticket 2', status: 'open', priority: 'medium', category: 'feature' },
        { title: 'Ticket 3', status: 'in_progress', priority: 'critical', category: 'bug' },
        { title: 'Ticket 4', status: 'resolved', priority: 'low', category: 'support' },
      ]);

      const res = await request(app)
        .get('/v1/insights/reports')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.totalTickets).toBe(4);
      expect(res.body).toEqual({
        totalTickets: 4,
        donuts: {
          status: [
            { key: 'open', label: 'Open', value: 2, percentage: 50 },
            { key: 'in_progress', label: 'In Progress', value: 1, percentage: 25 },
            { key: 'resolved', label: 'Resolved', value: 1, percentage: 25 },
            { key: 'blocked', label: 'Blocked', value: 0, percentage: 0 },
          ],
          priority: [
            { key: 'low', label: 'Low', value: 1, percentage: 25 },
            { key: 'medium', label: 'Medium', value: 1, percentage: 25 },
            { key: 'high', label: 'High', value: 1, percentage: 25 },
            { key: 'critical', label: 'Critical', value: 1, percentage: 25 },
          ],
        },
        horizontalBar: {
          label: 'Tickets by Category',
          data: [
            { key: 'bug', label: 'Bug', value: 2 },
            { key: 'feature', label: 'Feature', value: 1 },
            { key: 'support', label: 'Support', value: 1 },
            { key: 'task', label: 'Task', value: 0 },
          ],
        },
      });
    });

    test('should return zeroed chart data when there are no tickets', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .get('/v1/insights/reports')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        totalTickets: 0,
        donuts: {
          status: [
            { key: 'open', label: 'Open', value: 0, percentage: 0 },
            { key: 'in_progress', label: 'In Progress', value: 0, percentage: 0 },
            { key: 'resolved', label: 'Resolved', value: 0, percentage: 0 },
            { key: 'blocked', label: 'Blocked', value: 0, percentage: 0 },
          ],
          priority: [
            { key: 'low', label: 'Low', value: 0, percentage: 0 },
            { key: 'medium', label: 'Medium', value: 0, percentage: 0 },
            { key: 'high', label: 'High', value: 0, percentage: 0 },
            { key: 'critical', label: 'Critical', value: 0, percentage: 0 },
          ],
        },
        horizontalBar: {
          label: 'Tickets by Category',
          data: [
            { key: 'bug', label: 'Bug', value: 0 },
            { key: 'feature', label: 'Feature', value: 0 },
            { key: 'support', label: 'Support', value: 0 },
            { key: 'task', label: 'Task', value: 0 },
          ],
        },
      });
    });
  });
});
