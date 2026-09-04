import Fastify from 'fastify';

import { registerTelegramWebhookRoute } from './telegram-webhook-route.js';

export function buildApp({ handleTelegramMessage, logger = false } = {}) {
  if (!handleTelegramMessage || typeof handleTelegramMessage.execute !== 'function') {
    throw new TypeError('handleTelegramMessage must implement execute()');
  }

  const app = Fastify({ logger });

  registerTelegramWebhookRoute(app, { handleTelegramMessage });

  return app;
}
