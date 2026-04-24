const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const insightsValidation = require('../../validations/insights.validation');
const insightsController = require('../../controllers/insights.controller');

const router = express.Router();

router.get('/reports', auth('getInsights'), validate(insightsValidation.getReports), insightsController.getReports);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Insights
 *   description: Aggregated reporting for tickets
 */

/**
 * @swagger
 * /insights/reports:
 *   get:
 *     summary: Get ticket report charts
 *     description: Returns chart-ready data for two donut charts and one horizontal bar chart.
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTickets:
 *                   type: integer
 *                   example: 18
 *                 donuts:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChartDataPoint'
 *                     priority:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChartDataPoint'
 *                 horizontalBar:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: Tickets by Category
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChartDataPoint'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
