export function createRateMessage({ baseCurrency, quoteCurrency, rate, date, source }, messages) {
  return createRateMessageWithHeading(
    { baseCurrency, quoteCurrency, rate, date, source },
    messages,
    messages.rateHeading,
  );
}

export function createHistoricalRateMessage(
  { baseCurrency, quoteCurrency, rate, date, source },
  messages,
) {
  return createRateMessageWithHeading(
    { baseCurrency, quoteCurrency, rate, date, source },
    messages,
    messages.historicalRateHeading,
  );
}

function createRateMessageWithHeading(
  { baseCurrency, quoteCurrency, rate, date, source },
  messages,
  heading,
) {
  const lines = [
    heading,
    '',
    `1 ${baseCurrency} = ${formatNumber(rate, messages.locale)} ${quoteCurrency}`,
    `1 ${quoteCurrency} = ${formatNumber(1 / rate, messages.locale)} ${baseCurrency}`,
  ];

  if (date) {
    lines.push('', `${messages.rateDateLabel}: ${date}`);
  }

  lines.push(`${messages.sourceLabel}: ${formatSource(source, messages)}`);

  return lines.join('\n');
}

export function createConversionMessage(
  { amount, baseCurrency, convertedAmount, quoteCurrency, rate, date, source },
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

  lines.push(`${messages.sourceLabel}: ${formatSource(source, messages)}`);

  return lines.join('\n');
}

export function createMultipleRatesMessage({ baseCurrency, rates, source }, messages) {
  return createMultipleRatesMessageWithHeading(
    { baseCurrency, rates, source },
    messages,
    messages.multipleRatesHeading,
  );
}

export function createHistoricalMultipleRatesMessage({ baseCurrency, rates, source }, messages) {
  return createMultipleRatesMessageWithHeading(
    { baseCurrency, rates, source },
    messages,
    messages.historicalMultipleRatesHeading,
  );
}

function createMultipleRatesMessageWithHeading({ baseCurrency, rates, source }, messages, heading) {
  const dates = new Set(rates.map(rate => rate.date));
  const showDatePerRate = dates.size > 1;
  const rateLines = rates.map(rate => {
    const rateDate = showDatePerRate ? ` (${rate.date})` : '';

    return `1 ${baseCurrency} = ${formatNumber(rate.rate, messages.locale)} ${rate.quoteCurrency}${rateDate}`;
  });
  const lines = [heading, '', ...rateLines];

  if (dates.size === 1) {
    lines.push('', `${messages.rateDateLabel}: ${rates[0].date}`);
  }

  lines.push(`${messages.sourceLabel}: ${formatSource(source, messages)}`);

  return lines.join('\n');
}

function formatSource(source, messages) {
  return source ?? messages.automaticSourceName;
}

function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, {
    maximumSignificantDigits: 8,
  }).format(value);
}
