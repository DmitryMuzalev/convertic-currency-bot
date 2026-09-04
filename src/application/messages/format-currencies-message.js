const CURRENCIES_PER_LINE = 6;

export function createCurrenciesMessage(currencies, messages) {
  const codeLines = [];

  for (let index = 0; index < currencies.length; index += CURRENCIES_PER_LINE) {
    codeLines.push(
      currencies
        .slice(index, index + CURRENCIES_PER_LINE)
        .map(formatCurrencyLabel)
        .join(' · '),
    );
  }

  return [
    `${messages.currenciesHeading}: ${currencies.length}`,
    '',
    ...codeLines,
    '',
    messages.currenciesHint,
  ].join('\n');
}

function formatCurrencyLabel(currency) {
  return currency.symbol ? `${currency.symbol} ${currency.code}` : currency.code;
}
