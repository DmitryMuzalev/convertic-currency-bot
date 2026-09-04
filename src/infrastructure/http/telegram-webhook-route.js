export function registerTelegramWebhookRoute(app, { handleTelegramMessage }) {
  app.post('/webhooks/telegram', async request => {
    const message = getTextMessage(request.body);

    if (!message) {
      return { ok: true };
    }

    await handleTelegramMessage.execute({
      chatId: message.chat.id,
      text: message.text,
    });

    return { ok: true };
  });
}

function getTextMessage(update) {
  const message = update?.message;

  if (
    typeof message?.text !== 'string' ||
    message.text.trim() === '' ||
    !isValidChatId(message.chat?.id)
  ) {
    return null;
  }

  return message;
}

function isValidChatId(chatId) {
  return (
    (typeof chatId === 'number' && Number.isSafeInteger(chatId)) ||
    (typeof chatId === 'string' && chatId.trim() !== '')
  );
}
