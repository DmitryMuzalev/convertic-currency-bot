export function createErrorMessage(message, messages) {
  return [message, '', messages.errorNavigationHint].join('\n');
}
