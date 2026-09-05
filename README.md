# Convertic Currency Bot

Convertic is a Telegram bot for viewing currency exchange rates, converting amounts, retrieving historical rates, and comparing data from different rate providers.

[Open Convertic in Telegram](https://t.me/convertic_currency_bot)

The bot uses the [Frankfurter API](https://frankfurter.dev/) as its exchange-rate provider.

## Features

- Retrieve the latest available exchange rate for a currency against USD.
- Retrieve the latest available exchange rate for a specified currency pair.
- Convert a custom amount.
- Retrieve multiple currency exchange rates in a single request.
- Retrieve historical exchange rates for a specified date.
- Recognize natural-language currency requests.
- View catalogs of supported currencies and exchange-rate sources.
- Select a preferred central-bank source.
- Compare a currency pair using data from two to five sources.

## Supported requests

| Request | Example | Result |
| --- | --- | --- |
| Rate against USD | `EUR` | Latest EUR-to-USD rate and its reverse |
| Currency pair | `EUR GBP` | Latest EUR-to-GBP rate and its reverse |
| Convert to USD | `100 EUR` | Value of 100 EUR in USD |
| Convert a currency pair | `100 EUR GBP` | Value of 100 EUR in GBP |
| Multiple rates | `EUR USD GBP JPY` | EUR rates against USD, GBP, and JPY |
| Historical rate against USD | `EUR 2025-01-15` | EUR-to-USD rate for the specified date |
| Historical rate | `EUR USD 2025-01-15` | EUR-to-USD rate for the specified date |
| Multiple historical rates | `EUR USD GBP JPY 2025-01-15` | Historical EUR rates against multiple currencies |
| Natural-language request | `convert 100 EUR to GBP` | Recognized currency conversion request |

Currency codes are case-insensitive and must be supported by Frankfurter; use `/currencies` to view the current catalog. Amounts must be positive and may use a period or comma as the decimal separator. A multiple-rate request contains one base currency and from two to eight distinct quote currencies. Historical dates use the `YYYY-MM-DD` format and cannot be in the future.

## Telegram commands

| Command                    | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `/start`                   | Show the welcome message                                    |
| `/help`                    | Show usage examples and available commands                  |
| `/currencies`              | List currencies supported by Frankfurter                    |
| `/sources`                 | List available exchange-rate sources                        |
| `/source`                  | Show the currently selected source                          |
| `/source ECB`              | Use the selected source for subsequent requests             |
| `/source AUTO`             | Return to the consolidated Frankfurter rate                 |
| `/compare EUR USD ECB BOE` | Compare a currency pair using data from two to five sources |

Source keys are case-insensitive. The selected source is applied to subsequent rate, conversion, and historical requests. User preferences are stored in memory and reset whenever the application restarts.

## Technology stack

- Node.js 24 with native ECMAScript modules.
- Fastify 5.
- Native `fetch` for requests to the Frankfurter and Telegram Bot APIs.
- ESLint and Prettier for static analysis and formatting.
- npm and `package-lock.json` for reproducible dependency installation.

## Requirements

- Node.js 24.
- npm 11.
- A Telegram bot token obtained from [@BotFather](https://t.me/BotFather).

## Installation

Install the dependencies from `package-lock.json`:

```bash
npm ci
```

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Configure the application:

```dotenv
TELEGRAM_BOT_TOKEN=your_bot_token
LOCAL_PORT=3000
```

| Variable             | Required | Default | Description                             |
| -------------------- | -------- | ------- | --------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Yes      | —       | Token used to call the Telegram Bot API |
| `LOCAL_PORT`         | No       | `3000`  | Port used by the local Fastify server   |

## Local development

Start the server in watch mode:

```bash
npm run dev
```

By default, the application is available at `http://localhost:3000` and exposes the following webhook:

```text
POST /webhooks/telegram
```

Non-text Telegram updates and malformed messages are acknowledged with `{ "ok": true }` and then ignored.

## Testing through LocalTunnel

Telegram requires a public HTTPS address to deliver updates through a webhook. Keep the application running and open a second terminal:

```bash
npm run tunnel
```

LocalTunnel prints a public URL. Register it with Telegram from a third terminal:

```bash
npm run telegram:set-webhook -- https://your-tunnel-url
```

The script automatically appends `/webhooks/telegram` to the provided URL. Send `/start`, `EUR`, or another supported request to the bot.

After local testing, remove the webhook:

```bash
npm run telegram:delete-webhook
```

Stop the application and tunnel by pressing `Ctrl+C` in their respective terminals.

## Project structure

The codebase follows clean architecture, with dependencies directed toward the domain:

- `src/domain` contains currency and exchange-rate validation rules.
- `src/application` contains use cases, ports, response formatting, and request parsing.
- `src/adapters` integrates Frankfurter, Telegram, and preference storage.
- `src/infrastructure` contains configuration and HTTP setup.
- `src/create-app.js` composes the application dependencies.
- `scripts` contains the Telegram webhook management utility.
- `docs` contains the C4 architecture diagrams.

## Available scripts

| Command                                 | Description                                           |
| --------------------------------------- | ----------------------------------------------------- |
| `npm run dev`                           | Start the local server in watch mode                  |
| `npm start`                             | Start the server without file watching                |
| `npm run tunnel`                        | Expose local port 3000 through LocalTunnel            |
| `npm run telegram:set-webhook -- <url>` | Register the Telegram webhook                         |
| `npm run telegram:delete-webhook`       | Remove the Telegram webhook                           |
| `npm run lint`                          | Run ESLint                                            |
| `npm run format`                        | Format supported files with Prettier                  |
| `npm run format:check`                  | Check the formatting of supported files with Prettier |

## C4 model

The architecture diagrams are stored in the `docs` directory as C4-PlantUML source files:

- [System Context diagram](docs/c4-context.puml)
- [Container diagram](docs/c4-container.puml)
- [Component diagram](docs/c4-components.puml)
