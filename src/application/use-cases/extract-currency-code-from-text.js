const CURRENCY_CODE_PATTERN = /(?<![A-Za-z0-9_])[A-Za-z]{3}(?![A-Za-z0-9_])/;

export function extractCurrencyCodeFromText(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const match = text.match(CURRENCY_CODE_PATTERN);

  return match ? match[0].toUpperCase() : null;
}
