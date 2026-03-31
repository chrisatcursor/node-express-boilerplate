const express = require('express');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const packageJson = require('../package.json');

const app = express();
const buildId = process.env.BUILD_ID || process.env.GIT_SHA || 'dev';
const desktopClientScript = `
const statusPill = document.getElementById('status-pill');
const message = document.getElementById('message');
const version = document.getElementById('version');
const buildId = document.getElementById('build-id');
const uptime = document.getElementById('uptime');
const requestTotal = document.getElementById('request-total');
const lastError = document.getElementById('last-error');

const setStatus = (label, className) => {
  statusPill.textContent = label;
  statusPill.className = 'status ' + className;
};

const refresh = async () => {
  setStatus('Loading', 'loading');
  message.textContent = 'Fetching backend health...';

  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }
    const payload = await response.json();
    setStatus(payload.status === 'ok' ? 'Healthy' : 'Degraded', payload.status === 'ok' ? 'healthy' : 'error');
    version.textContent = payload.version || '-';
    buildId.textContent = payload.buildId || '-';
    uptime.textContent = Math.floor((payload.uptimeMs || 0) / 1000) + 's';
    requestTotal.textContent = payload.metrics && payload.metrics.requests ? payload.metrics.requests.total : '-';
    lastError.textContent =
      payload.metrics && payload.metrics.lastError && payload.metrics.lastError.class ? payload.metrics.lastError.class : 'none';
    message.textContent = 'Last refresh: ' + new Date().toLocaleTimeString();
  } catch (error) {
    setStatus('Error', 'error');
    message.textContent = error.message;
  }
};

refresh();
setInterval(refresh, 15000);
window.addEventListener('focus', refresh);
`;
const observability = {
  requestCounts: {
    total: 0,
    byMethod: {},
    byStatusClass: {},
  },
  lastError: {
    className: null,
    observedAt: null,
  },
  checks: {
    filesystem: 0,
    command: 0,
  },
};

const incrementCounter = (counterMap, key) => ({
  ...counterMap,
  [key]: (counterMap[key] || 0) + 1,
});

const getObservabilityPayload = () => {
  observability.checks.filesystem += 1;
  observability.checks.command += 1;
  const filesystemProbeHealthy = path.isAbsolute(process.cwd());
  const commandCheckPassed = typeof process.execPath === 'string' && process.execPath.length > 0;

  return {
    status: 'ok',
    service: 'backend',
    version: packageJson.version,
    buildId,
    uptimeMs: Math.round(process.uptime() * 1000),
    observedAt: new Date().toISOString(),
    metrics: {
      requests: {
        total: observability.requestCounts.total,
        byMethod: { ...observability.requestCounts.byMethod },
        byStatusClass: { ...observability.requestCounts.byStatusClass },
      },
      lastError: {
        class: observability.lastError.className,
        observedAt: observability.lastError.observedAt,
      },
      checks: {
        filesystem: {
          filesystemProbeHealthy,
          checksRun: observability.checks.filesystem,
        },
        commands: {
          commandCheckPassed,
          checksRun: observability.checks.command,
        },
      },
    },
  };
};

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use((req, res, next) => {
  observability.requestCounts.total += 1;
  observability.requestCounts.byMethod = incrementCounter(observability.requestCounts.byMethod, req.method);

  res.on('finish', () => {
    const statusBucket = `${Math.floor(res.statusCode / 100)}xx`;
    observability.requestCounts.byStatusClass = incrementCounter(observability.requestCounts.byStatusClass, statusBucket);
  });

  next();
});

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.get('/api/metrics', (req, res) => {
  const payload = getObservabilityPayload();
  res.send(payload.metrics);
});

app.get('/api/health', (req, res) => {
  res.send(getObservabilityPayload());
});

app.get('/api/health/desktop', (req, res) => {
  res.sendFile(path.join(__dirname, '../desktop/health.html'));
});

app.get('/api/health/desktop/app.js', (req, res) => {
  res.type('application/javascript').send(desktopClientScript);
});

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  observability.lastError.className = err && err.constructor && err.constructor.name ? err.constructor.name : 'Error';
  observability.lastError.observedAt = new Date().toISOString();
  next(err);
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
