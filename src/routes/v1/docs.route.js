const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef');

const router = express.Router();
const toolbarHealthScript = `
(() => {
  const statusNodeId = 'cursor-api-health-status';
  const endpoint = '/api/health';

  const upsertStatusNode = (message, title) => {
    const topbar = document.querySelector('.swagger-ui .topbar');
    if (!topbar) {
      return;
    }

    let statusNode = document.getElementById(statusNodeId);
    if (!statusNode) {
      statusNode = document.createElement('div');
      statusNode.id = statusNodeId;
      statusNode.style.marginLeft = '12px';
      statusNode.style.color = '#ffffff';
      statusNode.style.fontSize = '12px';
      statusNode.style.fontFamily = 'monospace';
      statusNode.style.opacity = '0.9';
      topbar.appendChild(statusNode);
    }

    statusNode.textContent = message;
    statusNode.title = title;
  };

  const renderFromPayload = (payload) => {
    if (!payload || typeof payload !== 'object') {
      upsertStatusNode('Health: unavailable', 'Unable to parse health payload');
      return;
    }

    const ok = payload.ok === true;
    const version = typeof payload.version === 'string' ? payload.version : 'unknown';
    const uptimeSeconds = Number.isFinite(payload.uptimeSeconds) ? payload.uptimeSeconds : null;
    const uptimeLabel = uptimeSeconds === null ? 'n/a' : String(Math.max(0, Math.floor(uptimeSeconds)));
    const statusLabel = ok ? 'ok' : 'degraded';
    upsertStatusNode(
      \`API: \${statusLabel} · v\${version} · up \${uptimeLabel}s\`,
      'Live status from /api/health'
    );
  };

  const renderError = () => {
    upsertStatusNode('Health: unavailable', 'Could not load /api/health');
  };

  const updateHealthStatus = () => {
    fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } })
      .then((response) => response.json())
      .then((payload) => renderFromPayload(payload))
      .catch(() => renderError());
  };

  window.addEventListener('load', () => {
    updateHealthStatus();
    window.setInterval(updateHealthStatus, 30000);
  });
})();
`;

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/v1/*.js'],
});

router.use('/', swaggerUi.serve);
router.get('/health-toolbar.js', (_req, res) => {
  res.type('application/javascript').send(toolbarHealthScript);
});
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
    customJs: '/v1/docs/health-toolbar.js',
  })
);

module.exports = router;
