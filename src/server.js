import Fastify from 'fastify';

import { createApp } from './create-app.js';
import { loadConfig } from '#infrastructure/config/load-config.js';

const config = loadConfig();
const app = createApp({
  httpServer: Fastify({ logger: true }),
  telegramBotToken: config.telegramBotToken,
});

void app
  .listen({
    host: '0.0.0.0',
    port: config.localPort,
  })
  .catch(error => {
    app.log.error(error);
    process.exitCode = 1;
  });
