import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import config from '../config/config';

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { version: string };

const swaggerDef: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'node-express-boilerplate API documentation',
    version: packageJson.version,
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

export default swaggerDef;
