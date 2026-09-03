# Convertic Currency Bot

Telegram bot that accepts a three-letter currency code and returns its exchange rate against the US dollar.

Example:

```text
EUR
1 EUR = 1.17 USD
```

Exchange rates are provided by the [Frankfurter API](https://frankfurter.dev/).

## Requirements

- Node.js 24
- npm 11
- Telegram bot token obtained from [@BotFather](https://t.me/BotFather)

## Installation

Install the dependencies:

```bash
npm install
```

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Set your Telegram bot token in `.env`:

```dotenv
TELEGRAM_BOT_TOKEN=your_bot_token
LOCAL_PORT=3000
```

The `.env` file contains secrets and is ignored by Git.

## Local development

Start the server in watch mode:

```bash
npm run dev
```

The server listens on `http://localhost:3000` by default. The Telegram webhook endpoint is:

```text
POST /webhooks/telegram
```

## Testing the bot through LocalTunnel

Telegram needs a public HTTPS address to deliver webhook updates. Keep the local server running and open a second terminal:

```bash
npm run tunnel
```

LocalTunnel will print a public URL. Register it with Telegram in a third terminal:

```bash
npm run telegram:set-webhook -- https://your-tunnel-url
```

The script automatically adds `/webhooks/telegram` to the URL. You can now send a currency code such as `EUR` to the bot.

When testing is complete, remove the webhook:

```bash
npm run telegram:delete-webhook
```

Stop the server and tunnel with `Ctrl+C` in their terminals.

## Commands

| Command                                 | Description                                |
| --------------------------------------- | ------------------------------------------ |
| `npm run dev`                           | Start the local server in watch mode       |
| `npm start`                             | Start the local server                     |
| `npm run tunnel`                        | Expose local port 3000 through LocalTunnel |
| `npm run telegram:set-webhook -- <url>` | Register the Telegram webhook              |
| `npm run telegram:delete-webhook`       | Remove the Telegram webhook                |
| `npm run lint`                          | Run ESLint                                 |
| `npm run format`                        | Format files with Prettier                 |
| `npm run format:check`                  | Check formatting with Prettier             |

## Architecture

The project follows clean architecture principles:

```text
src/
├── domain/          Domain rules and errors
├── application/     Ports and use cases
├── adapters/        Frankfurter and Telegram API implementations
├── infrastructure/  Configuration and Fastify HTTP transport
├── create-app.js    Application composition
└── main.js          Local server entry point
scripts/
└── manage-telegram-webhook.js
```

Dependencies point inward: application use cases do not import Fastify or external API implementations.

## Current status

The bot can be run and tested locally through a tunnel.
