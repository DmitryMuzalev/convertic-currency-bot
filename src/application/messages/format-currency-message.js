export function createRateMessage({ baseCurrency, quoteCurrency, rate, date }, messages) {
  const lines = [
    messages.rateHeading,
    '',
    `1 ${baseCurrency} = ${formatNumber(rate, messages.locale)} ${quoteCurrency}`,
    `1 ${quoteCurrency} = ${formatNumber(1 / rate, messages.locale)} ${baseCurrency}`,
  ];

  if (date) {
    lines.push('', `${messages.rateDateLabel}: ${date}`);
  }

  return lines.join('\n');
}

export function createConversionMessage(
  { amount, baseCurrency, convertedAmount, quoteCurrency, rate, date },
  messages,
) {
  const lines = [
    messages.conversionHeading,
    '',
    `${formatNumber(amount, messages.locale)} ${baseCurrency} = ${formatNumber(
      convertedAmount,
      messages.locale,
    )} ${quoteCurrency}`,
    `${messages.rateLabel}: 1 ${baseCurrency} = ${formatNumber(
      rate,
      messages.locale,
    )} ${quoteCurrency}`,
    `${messages.reverseLabel}: 1 ${quoteCurrency} = ${formatNumber(
      1 / rate,
      messages.locale,
    )} ${baseCurrency}`,
  ];

  if (date) {
    lines.push('', `${messages.rateDateLabel}: ${date}`);
  }

  return lines.join('\n');
}

function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, {
    maximumSignificantDigits: 8,
  }).format(value);
}
