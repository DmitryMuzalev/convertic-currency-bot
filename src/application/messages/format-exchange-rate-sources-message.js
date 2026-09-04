export function createSourcesMessage(sources, messages) {
  const sourceLines = sources.map(
    source => `${createFlag(source.countryCode)} ${source.key} — ${source.name}`,
  );

  return [
    messages.sourcesHeading,
    `${sources.length} ${messages.sourcesAvailableLabel}`,
    '',
    ...sourceLines,
    '',
    messages.sourcesHint,
  ].join('\n');
}

export function createCurrentSourceMessage(source, messages) {
  return `${messages.currentSourceLabel}: ${source ?? messages.automaticSourceName}`;
}

export function createSelectedSourceMessage(source, messages) {
  if (source === null) {
    return messages.automaticSourceSelected;
  }

  return `${messages.sourceSelectedHeading}: ${source.key} — ${source.name}`;
}

function createFlag(countryCode) {
  if (typeof countryCode !== 'string' || !/^[A-Z]{2}$/.test(countryCode)) {
    return '🏦';
  }

  return String.fromCodePoint(
    ...[...countryCode].map(character => 0x1f1e6 + character.charCodeAt(0) - 65),
  );
}
