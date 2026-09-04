export const START_MESSAGE = [
  "🎩 Welcome! I'm Convertic, your currency magician.",
  '',
  'Give me a currency pair or an amount, and I will perform a little conversion magic.',
  '',
  'Try: EUR, EUR GBP, or 100 EUR GBP',
  '',
  'Use /help to see the full instructions. ✨',
].join('\n');

export const HELP_MESSAGE = [
  "🪄 Convertic's spell book",
  '',
  'Send a currency code, a currency pair, or an amount to convert.',
  '',
  'Examples:',
  'EUR — EUR to USD rate',
  'EUR GBP — EUR to GBP rate',
  '100 EUR — convert EUR to USD',
  '100 EUR GBP — convert EUR to GBP',
  '',
  'Available commands:',
  '/start — meet Convertic',
  '/help — show these instructions',
  '',
  'More currency tricks are coming soon! ✨',
].join('\n');

export const UNKNOWN_COMMAND_MESSAGE =
  '🎩 That spell is not in my book yet. Try /help to see what I can do.';

export const INVALID_CURRENCY_REQUEST_MESSAGE = [
  '🪄 I could not understand that currency spell.',
  'Try EUR, EUR GBP, 100 EUR, or 100 EUR GBP.',
].join('\n');

export const CURRENCY_PAIR_NOT_FOUND_MESSAGE =
  '🔮 I could not find that currency pair. Check the three-letter currency codes and try again.';

export const EXCHANGE_RATE_UNAVAILABLE_MESSAGE =
  '☁️ My crystal ball is cloudy right now. Please try again in a moment.';

export function createRateMessage({ baseCurrency, quoteCurrency, rate, date }) {
  const lines = [
    '🎩 Ta-da! Here is the exchange-rate reveal:',
    '',
    `1 ${baseCurrency} = ${formatNumber(rate)} ${quoteCurrency}`,
    `1 ${quoteCurrency} = ${formatNumber(1 / rate)} ${baseCurrency}`,
  ];

  if (date) {
    lines.push('', `📅 Rate date: ${date}`);
  }

  return lines.join('\n');
}

export function createConversionMessage({
  amount,
  baseCurrency,
  convertedAmount,
  quoteCurrency,
  rate,
  date,
}) {
  const lines = [
    '✨ Conversion complete!',
    '',
    `${formatNumber(amount)} ${baseCurrency} = ${formatNumber(convertedAmount)} ${quoteCurrency}`,
    `Rate: 1 ${baseCurrency} = ${formatNumber(rate)} ${quoteCurrency}`,
    `Reverse: 1 ${quoteCurrency} = ${formatNumber(1 / rate)} ${baseCurrency}`,
  ];

  if (date) {
    lines.push('', `📅 Rate date: ${date}`);
  }

  return lines.join('\n');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 8,
  }).format(value);
}
