const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef');

const router = express.Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/v1/*.js'],
});

const docsFavicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%2326251e'/%3E%3Ctext x='50%25' y='54%25' font-size='28' text-anchor='middle' fill='%23f54e00' font-family='Arial'%3ENB%3C/text%3E%3C/svg%3E";

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: swaggerDefinition.info.title,
    customfavIcon: docsFavicon,
  })
);

module.exports = router;
