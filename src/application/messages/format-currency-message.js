import { formatCurrencyValue } from './format-currency-value.js';

export function createSameCurrencyMessage({ type, amount, baseCurrency, date }, messages) {
  const value = formatCurrencyValue(
    type === 'conversion' ? amount : 1,
    baseCurrency,
    messages.locale,
  );

  if (type === 'historical-rate') {
    return [
      fillCurrencyPlaceholder(messages.historicalSameCurrencyMessage, baseCurrency),
      '',
      `${value} = ${value}`,
      `${messages.rateDateLabel}: ${date}`,
    ].join('\n');
  }

  return [
    messages.sameCurrencyHeading,
    '',
    `${value} = ${value}`,
    '',
    messages.sameCurrencyPunchline,
  ].join('\n');
}

export function createDuplicateCurrencyMessage(currency, messages) {
  return [
    fillCurrencyPlaceholder(messages.duplicateCurrencyMessage, currency),
    '',
    messages.duplicateCurrencyHint,
  ].join('\n');
}

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
    `${formatCurrencyValue(1, baseCurrency, messages.locale)} = ${formatCurrencyValue(
      rate,
      quoteCurrency,
      messages.locale,
    )}`,
    `${messages.reverseLabel}: ${formatCurrencyValue(
      1,
      quoteCurrency,
      messages.locale,
    )} = ${formatCurrencyValue(1 / rate, baseCurrency, messages.locale)}`,
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
    `${formatCurrencyValue(amount, baseCurrency, messages.locale)} → ${formatCurrencyValue(
      convertedAmount,
      quoteCurrency,
      messages.locale,
    )}`,
    '',
    `${messages.rateLabel}: ${formatCurrencyValue(
      1,
      baseCurrency,
      messages.locale,
    )} = ${formatCurrencyValue(rate, quoteCurrency, messages.locale)}`,
    `${messages.reverseLabel}: ${formatCurrencyValue(
      1,
      quoteCurrency,
      messages.locale,
    )} = ${formatCurrencyValue(1 / rate, baseCurrency, messages.locale)}`,
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
    const rateDate = showDatePerRate ? ` · ${rate.date}` : '';

    return `→ ${formatCurrencyValue(rate.rate, rate.quoteCurrency, messages.locale)}${rateDate}`;
  });
  const lines = [heading, '', formatCurrencyValue(1, baseCurrency, messages.locale), ...rateLines];

  if (dates.size === 1) {
    lines.push('', `${messages.rateDateLabel}: ${rates[0].date}`);
  }

  lines.push(`${messages.sourceLabel}: ${formatSource(source, messages)}`);

  return lines.join('\n');
}

function formatSource(source, messages) {
  return source ?? messages.automaticSourceName;
}

function fillCurrencyPlaceholder(message, currency) {
  return message.replaceAll('{currency}', currency);
}
