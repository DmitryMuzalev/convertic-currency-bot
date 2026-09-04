export const START_MESSAGE = [
  "🎩 Welcome! I'm Convertic, your currency magician.",
  '',
  'Send me a three-letter currency code, and I will reveal its exchange rate against USD.',
  '',
  'Example: EUR',
  '',
  'Use /help to see the full instructions. ✨',
].join('\n');

export const HELP_MESSAGE = [
  "🪄 Convertic's spell book",
  '',
  'Send a three-letter currency code to get its exchange rate against USD.',
  '',
  'Example:',
  'EUR',
  '',
  'I will reply with something like:',
  '1 EUR = 1.17 USD',
  '',
  'Available commands:',
  '/start — meet Convertic',
  '/help — show these instructions',
  '',
  'More currency tricks are coming soon! ✨',
].join('\n');

export const UNKNOWN_COMMAND_MESSAGE =
  '🎩 That spell is not in my book yet. Try /help to see what I can do.';
