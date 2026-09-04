import { MAX_QUOTE_CURRENCIES } from '#application/rules/currency-request-limits.js';

import { parseCurrencyRequest } from './parse-currency-request.js';

const TOKEN_PATTERN =
  /(?<![A-Za-z0-9_])(?:[0-9]{4}-[0-9]{2}-[0-9]{2}|[A-Za-z]+|[0-9]+(?:[.,][0-9]+)?)(?![A-Za-z0-9_])/g;
const AMOUNT_PATTERN = /^[0-9]+(?:[.,][0-9]+)?$/;
const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export function extractCurrencyRequestFromText(text, currencies) {
  if (typeof text !== 'string' || !Array.isArray(currencies)) {
    return null;
  }

  const currencyCodes = new Set(currencies.map(currency => currency.code));
  const tokens = [...text.matchAll(TOKEN_PATTERN)].map(match => ({
    index: match.index,
    value: match[0],
  }));
  const amountTokens = tokens.filter(token => AMOUNT_PATTERN.test(token.value));
  const dateTokens = tokens.filter(token => DATE_PATTERN.test(token.value));

  if (amountTokens.length > 1 || dateTokens.length > 1) {
    return null;
  }

  const currencyTokens = tokens.filter(
    token => token.value.length === 3 && currencyCodes.has(token.value.toUpperCase()),
  );

  if (dateTokens.length === 1) {
    return extractHistoricalRateRequest(dateTokens[0], amountTokens, currencyTokens);
  }

  if (amountTokens.length === 1) {
    return extractConversionRequest(amountTokens[0], currencyTokens);
  }

  if (currencyTokens.length < 1 || currencyTokens.length > MAX_QUOTE_CURRENCIES + 1) {
    return null;
  }

  return parseCurrencyRequest(currencyTokens.map(token => token.value).join(' '));
}

function extractHistoricalRateRequest(dateToken, amountTokens, currencyTokens) {
  if (
    amountTokens.length > 0 ||
    currencyTokens.length < 1 ||
    currencyTokens.length > MAX_QUOTE_CURRENCIES + 1
  ) {
    return null;
  }

  return parseCurrencyRequest(
    [...currencyTokens.map(token => token.value), dateToken.value].join(' '),
  );
}

function extractConversionRequest(amountToken, currencyTokens) {
  const currenciesAfterAmount = currencyTokens.filter(token => token.index > amountToken.index);

  if (currenciesAfterAmount.length < 1 || currenciesAfterAmount.length > 2) {
    return null;
  }

  return parseCurrencyRequest(
    [amountToken.value, ...currenciesAfterAmount.map(token => token.value)].join(' '),
  );
}
