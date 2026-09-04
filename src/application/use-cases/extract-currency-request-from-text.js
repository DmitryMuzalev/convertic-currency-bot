import { parseCurrencyRequest } from './parse-currency-request.js';

const TOKEN_PATTERN = /(?<![A-Za-z0-9_])(?:[A-Za-z]+|[0-9]+(?:[.,][0-9]+)?)(?![A-Za-z0-9_])/g;
const AMOUNT_PATTERN = /^[0-9]+(?:[.,][0-9]+)?$/;

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

  if (amountTokens.length > 1) {
    return null;
  }

  const currencyTokens = tokens.filter(
    token => token.value.length === 3 && currencyCodes.has(token.value.toUpperCase()),
  );

  if (amountTokens.length === 1) {
    return extractConversionRequest(amountTokens[0], currencyTokens);
  }

  if (currencyTokens.length < 1 || currencyTokens.length > 2) {
    return null;
  }

  return parseCurrencyRequest(currencyTokens.map(token => token.value).join(' '));
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
