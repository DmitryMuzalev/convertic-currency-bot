const SOURCES_PER_LINE = 10;

export function createSourcesMessage(sources, messages) {
  const sourceLines = [];

  for (let index = 0; index < sources.length; index += SOURCES_PER_LINE) {
    sourceLines.push(
      sources
        .slice(index, index + SOURCES_PER_LINE)
        .map(source => source.key)
        .join(' · '),
    );
  }

  return [
    `${messages.sourcesHeading}: ${sources.length}`,
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
