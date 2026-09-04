export function registerTelegramWebhookRoute(app, { handleTelegramMessage }) {
  app.post('/webhooks/telegram', async request => {
    const message = getTextMessage(request.body);

    if (!message) {
      return { ok: true };
    }

    await handleTelegramMessage.execute({
      chatId: message.chat.id,
      userId: message.from.id,
      text: message.text,
      languageCode: message.from?.language_code,
    });

    return { ok: true };
  });
}

function getTextMessage(update) {
  const message = update?.message;

  if (
    typeof message?.text !== 'string' ||
    message.text.trim() === '' ||
    !isValidIdentifier(message.chat?.id) ||
    !isValidIdentifier(message.from?.id)
  ) {
    return null;
  }

  return message;
}

function isValidIdentifier(identifier) {
  return (
    (typeof identifier === 'number' && Number.isSafeInteger(identifier)) ||
    (typeof identifier === 'string' && identifier.trim() !== '')
  );
}
