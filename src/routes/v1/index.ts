import express, { Router } from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import config from '../../config/config';

interface Route {
  path: string;
  route: Router;
}

const router: Router = express.Router();

const defaultRoutes: Route[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
];

const devRoutes: Route[] = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route: Route): void => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route: Route): void => {
    router.use(route.path, route.route);
  });
}

export = router;
