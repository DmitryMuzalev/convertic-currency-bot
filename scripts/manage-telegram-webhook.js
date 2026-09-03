const TELEGRAM_API_BASE_URL = 'https://api.telegram.org';
const TELEGRAM_WEBHOOK_PATH = '/webhooks/telegram';

const [action, baseUrl] = process.argv.slice(2);

try {
  if (action === 'set') {
    const webhookUrl = createWebhookUrl(baseUrl);

    await callTelegramApi('setWebhook', {
      url: webhookUrl,
      allowed_updates: ['message'],
    });

    console.log(`Webhook set: ${webhookUrl}`);
  } else if (action === 'delete') {
    await callTelegramApi('deleteWebhook');
    console.log('Webhook deleted');
  } else {
    throw new Error('Expected action: set or delete');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function createWebhookUrl(baseUrl) {
  if (!baseUrl) {
    throw new Error('Pass the tunnel URL after --');
  }

  let webhookUrl;

  try {
    webhookUrl = new URL(baseUrl);
  } catch {
    throw new Error('Tunnel URL must be a valid URL');
  }

  if (webhookUrl.protocol !== 'https:') {
    throw new Error('Tunnel URL must use HTTPS');
  }

  webhookUrl.pathname = TELEGRAM_WEBHOOK_PATH;
  webhookUrl.search = '';
  webhookUrl.hash = '';

  return webhookUrl.toString();
}

async function callTelegramApi(method, body = {}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN must be set in .env');
  }

  const response = await fetch(`${TELEGRAM_API_BASE_URL}/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error('Telegram Bot API returned invalid JSON');
  }

  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.description ?? `Telegram Bot API returned HTTP ${response.status}`);
  }
}
