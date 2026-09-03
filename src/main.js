import { createApp } from './create-app.js';
import { loadConfig } from '#infrastructure/config/load-config.js';

const config = loadConfig();
const app = createApp({
  telegramBotToken: config.telegramBotToken,
  logger: true,
});

try {
  await app.listen({
    host: '0.0.0.0',
    port: config.localPort,
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
