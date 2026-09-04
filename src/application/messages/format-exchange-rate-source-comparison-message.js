export function createSourceComparisonMessage(
  { baseCurrency, quoteCurrency, comparisons },
  messages,
) {
  const comparisonLines = comparisons.map(comparison => {
    if (!comparison.available) {
      return `🏦 ${comparison.source.key}: ${messages.comparisonSourceUnavailable}`;
    }

    return `🏦 ${comparison.source.key}: ${formatCurrencyValue(
      comparison.rate,
      quoteCurrency,
      messages.locale,
    )} · ${comparison.date}`;
  });

  return [
    messages.comparisonHeading,
    '',
    `${formatCurrencyValue(1, baseCurrency, messages.locale)} → ${quoteCurrency}`,
    '',
    ...comparisonLines,
  ].join('\n');
}
import { formatCurrencyValue } from './format-currency-value.js';
