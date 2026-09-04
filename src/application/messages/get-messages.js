import { ENGLISH_MESSAGES } from './en.js';
import { RUSSIAN_MESSAGES } from './ru.js';

const RUSSIAN_LANGUAGE_PATTERN = /^ru(?:[-_]|$)/i;

export function getMessages(languageCode) {
  if (typeof languageCode === 'string' && RUSSIAN_LANGUAGE_PATTERN.test(languageCode.trim())) {
    return RUSSIAN_MESSAGES;
  }

  return ENGLISH_MESSAGES;
}
