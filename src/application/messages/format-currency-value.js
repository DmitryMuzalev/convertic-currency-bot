export function formatCurrencyValue(value, currencyCode, locale) {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
      maximumSignificantDigits: 8,
    });
    const formattedValue = formatter.format(value);
    const currencyPart = formatter
      .formatToParts(value)
      .find(part => part.type === 'currency')?.value;

    return currencyPart === currencyCode ? formattedValue : `${formattedValue} (${currencyCode})`;
  } catch (error) {
    if (!(error instanceof RangeError)) {
      throw error;
    }

    return `${formatNumber(value, locale)} ${currencyCode}`;
  }
}

export function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, {
    maximumSignificantDigits: 8,
  }).format(value);
}
