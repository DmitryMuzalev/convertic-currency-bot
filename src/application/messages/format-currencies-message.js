const CODES_PER_LINE = 12;

export function createCurrenciesMessage(currencies, messages) {
  const codeLines = [];

  for (let index = 0; index < currencies.length; index += CODES_PER_LINE) {
    codeLines.push(
      currencies
        .slice(index, index + CODES_PER_LINE)
        .map(currency => currency.code)
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
