# Repository Guidelines

## Project

- This is a Node.js 24 project using native ECMAScript modules.
- Use `import` and `export`; include the `.js` extension in local import paths.
- Keep secrets in `.env`. Never commit tokens, credentials, or other secret values.

## Architecture

- Follow clean architecture and keep dependencies directed inward.
- `src/domain` contains domain errors and rules and must not depend on other layers.
- `src/application` contains ports and use cases and may depend only on the domain.
- `src/adapters` contains implementations for external services such as Frankfurter and Telegram.
- `src/infrastructure` contains configuration, HTTP setup, and application composition.
- `api` contains thin Vercel Function entry points. Do not place business logic there.
- `src/main.js` is the entry point for local server startup.
- Pass external dependencies into use cases instead of importing adapters from use cases.
- Use the `#domain/*`, `#application/*`, `#adapters/*`, and `#infrastructure/*` aliases for imports between layers instead of parent-directory relative paths.
- Keep relative imports for modules within the same directory or feature when they remain short and clear.

## Naming

- Name files and directories with `kebab-case`.
- Name classes and custom errors with `PascalCase`.
- Name functions, methods, parameters, and variables with `camelCase`.
- Name module-level constants with `UPPER_SNAKE_CASE`.
- Name use-case files after an action, for example `get-exchange-rate-against-usd.js`.
- Name adapter files after the service and implemented role, for example `frankfurter-exchange-rate-provider.js`.

## Code Style

- Follow the existing ESLint and Prettier configuration.
- Prefer small modules with one clear responsibility.
- Use the built-in `fetch` API for HTTP requests unless a dependency is clearly justified.
- Do not add production dependencies without first explaining why they are needed.
- Do not add automated tests until the user explicitly asks to introduce testing.

## Verification

- After changing JavaScript or JSON files, run `npm.cmd run lint` and `npm.cmd run format:check` on Windows.
- Do not create Git commits unless the user explicitly asks for a commit.

## Commits

- Follow the Conventional Commits specification for commit messages.
- Use the format `type(scope): description`; omit the scope when it does not add useful context.
- Use an appropriate type such as `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, or `build`.
- Write the description in English, in lowercase, using the imperative mood, without a trailing period.
- Mark breaking changes with `!` after the type or scope and explain them in the commit body.
- Before creating a commit, show the proposed commit message to the user unless the user already provided it explicitly.
