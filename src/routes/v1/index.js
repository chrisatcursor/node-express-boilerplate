const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const auth = require('../../middlewares/auth');
const config = require('../../config/config');

const router = express.Router();
const labsRoute = express.Router();

labsRoute.get('/feature-flags', auth(), (req, res) => {
  res.send({
    title: 'Labs',
    navigation: {
      label: 'Labs',
      badge: 'new',
      after: 'Administration',
    },
    featureFlags: config.featureFlags,
  });
});

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/labs',
    route: labsRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Labs page and feature flags
 */

/**
 * @swagger
 * /labs/feature-flags:
 *   get:
 *     summary: Get feature flags for the Labs page
 *     description: Signed in users can view Labs page metadata and feature flags.
 *     tags: [Labs]
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
 *                 title:
 *                   type: string
 *                   example: Labs
 *                 navigation:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: Labs
 *                     badge:
 *                       type: string
 *                       example: new
 *                     after:
 *                       type: string
 *                       example: Administration
 *                 featureFlags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                       isNew:
 *                         type: boolean
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
