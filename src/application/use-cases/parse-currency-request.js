const DEFAULT_QUOTE_CURRENCY = 'USD';
const CURRENCY_CODE = '[A-Za-z]{3}';
const AMOUNT = '[0-9]+(?:[.,][0-9]+)?';
const END_PUNCTUATION = '[.!?]?';

const CONVERSION_PATTERN = new RegExp(
  `^(${AMOUNT})\\s+(${CURRENCY_CODE})(?:\\s+(${CURRENCY_CODE}))?${END_PUNCTUATION}$`,
);
const RATE_PATTERN = new RegExp(
  `^(${CURRENCY_CODE})(?:\\s+(${CURRENCY_CODE}))?${END_PUNCTUATION}$`,
);

export function parseCurrencyRequest(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const normalizedText = text.trim();
  const conversionMatch = normalizedText.match(CONVERSION_PATTERN);

  if (conversionMatch) {
    const amount = Number(conversionMatch[1].replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    return {
      type: 'conversion',
      amount,
      baseCurrency: conversionMatch[2].toUpperCase(),
      quoteCurrency: (conversionMatch[3] ?? DEFAULT_QUOTE_CURRENCY).toUpperCase(),
    };
  }

  const rateMatch = normalizedText.match(RATE_PATTERN);

  if (!rateMatch) {
    return null;
  }

  return {
    type: 'rate',
    baseCurrency: rateMatch[1].toUpperCase(),
    quoteCurrency: (rateMatch[2] ?? DEFAULT_QUOTE_CURRENCY).toUpperCase(),
  };
}
