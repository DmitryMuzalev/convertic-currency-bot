const CURRENCIES_PER_LINE = 6;
const POPULAR_CURRENCY_CODES = Object.freeze([
  'EUR',
  'USD',
  'GBP',
  'JPY',
  'CHF',
  'CNY',
  'CAD',
  'AUD',
  'RUB',
]);

export function createCurrenciesMessage(currencies, messages) {
  const sortedCurrencies = [...currencies].sort((first, second) =>
    first.code.localeCompare(second.code),
  );
  const currenciesByCode = new Map(sortedCurrencies.map(currency => [currency.code, currency]));
  const popularCurrencies = POPULAR_CURRENCY_CODES.map(code => currenciesByCode.get(code)).filter(
    Boolean,
  );
  const groups = groupCurrenciesByFirstLetter(sortedCurrencies);
  const catalogLines = [];

  for (const [letter, group] of groups) {
    catalogLines.push(letter, ...formatCurrencyLines(group, formatCurrencyCode), '');
  }

  return [
    messages.currenciesHeading,
    `${messages.currenciesAvailableLabel}: ${currencies.length}`,
    '',
    messages.popularCurrenciesHeading,
    ...formatCurrencyLines(popularCurrencies, formatCurrencyLabel),
    '',
    messages.allCurrenciesHeading,
    '',
    ...catalogLines,
    messages.currenciesHint,
  ].join('\n');
}

function groupCurrenciesByFirstLetter(currencies) {
  const groups = new Map();

  for (const currency of currencies) {
    const letter = currency.code.charAt(0);
    const group = groups.get(letter) ?? [];

    group.push(currency);
    groups.set(letter, group);
  }

  return groups;
}

function formatCurrencyLines(currencies, formatCurrency) {
  const lines = [];

  for (let index = 0; index < currencies.length; index += CURRENCIES_PER_LINE) {
    lines.push(
      currencies
        .slice(index, index + CURRENCIES_PER_LINE)
        .map(formatCurrency)
        .join(' · '),
    );
  }

  return lines;
}

function formatCurrencyCode(currency) {
  return currency.code;
}

function formatCurrencyLabel(currency) {
  const symbol = currency.symbol?.trim();

  return symbol && symbol.toUpperCase() !== currency.code
    ? `${symbol} ${currency.code}`
    : currency.code;
}
