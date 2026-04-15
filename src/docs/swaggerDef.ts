import config = require('../config/config');

interface PackageJson {
  version: string;
}

interface SwaggerDefinition {
  openapi: string;
  info: {
    title: string;
    version: string;
    license: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const packageJson = require('../../package.json') as PackageJson;

const swaggerDef: SwaggerDefinition = {
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

export = swaggerDef;
