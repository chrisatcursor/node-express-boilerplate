import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import config = require('../../config/config');
import ApiError = require('../../utils/ApiError');

interface LabsNavigation {
  label: 'Labs';
  badge: 'new';
  after: 'Administration';
}

interface LabsFeatureFlagsResponse {
  title: 'Labs';
  navigation: LabsNavigation;
  featureFlags: typeof config.featureFlags;
}

const router = express.Router();

const requireSignedIn: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: Express.User | false | null | undefined): void => {
    if (err || !user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    req.user = user;
    return next();
  })(req, res, next);
};

const labsNavigation: LabsNavigation = {
  label: 'Labs',
  badge: 'new',
  after: 'Administration',
};

const getFeatureFlags = (_req: Request, res: Response<LabsFeatureFlagsResponse>): void => {
  res.send({
    title: 'Labs',
    navigation: labsNavigation,
    featureFlags: config.featureFlags,
  });
};

router.get('/feature-flags', requireSignedIn, getFeatureFlags);

export = router;

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
