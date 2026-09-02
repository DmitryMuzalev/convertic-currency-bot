import { ConfigurationError } from './configuration-error.js';

const DEFAULT_LOCAL_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;

export function loadConfig(environment = process.env) {
  const telegramBotToken = readRequiredString(environment, 'TELEGRAM_BOT_TOKEN');
  const localPort = parseLocalPort(environment.LOCAL_PORT);

  return Object.freeze({
    telegramBotToken,
    localPort,
  });
}

function readRequiredString(environment, name) {
  const value = environment[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new ConfigurationError(`${name} must be a non-empty string`);
  }

  return value.trim();
}

function parseLocalPort(value) {
  const port = Number(value || DEFAULT_LOCAL_PORT);

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new ConfigurationError('LOCAL_PORT must be an integer between 1 and 65535');
  }

  return port;
}
