export function createSourceComparisonMessage(
  { baseCurrency, quoteCurrency, comparisons },
  messages,
) {
  const comparisonLines = comparisons.map(comparison => {
    if (!comparison.available) {
      return `🏦 ${comparison.source.key}: ${messages.comparisonSourceUnavailable}`;
    }

    const rate = new Intl.NumberFormat(messages.locale, {
      maximumSignificantDigits: 8,
    }).format(comparison.rate);

    return `🏦 ${comparison.source.key}: ${rate} ${quoteCurrency} · ${comparison.date}`;
  });

  return [
    messages.comparisonHeading,
    '',
    `1 ${baseCurrency} → ${quoteCurrency}`,
    '',
    ...comparisonLines,
  ].join('\n');
}
