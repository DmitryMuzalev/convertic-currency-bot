import Fastify from 'fastify';

import { registerTelegramWebhookRoute } from './telegram-webhook-route.js';

export function buildApp({ handleCurrencyMessage, logger = false } = {}) {
  if (!handleCurrencyMessage || typeof handleCurrencyMessage.execute !== 'function') {
    throw new TypeError('handleCurrencyMessage must implement execute()');
  }

  const app = Fastify({ logger });

  registerTelegramWebhookRoute(app, { handleCurrencyMessage });

  return app;
}
