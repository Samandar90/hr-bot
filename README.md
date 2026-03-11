# Telegram HR Bot (Clean Architecture)

Production-ready HR Telegram bot built with Node.js, TypeScript, Telegraf, Express, Prisma, and PostgreSQL.

## Features

- Single admin access controlled by `ADMIN_TELEGRAM_ID`
- Unlimited candidates with guided application flow
- Clean Telegram UX using editable screens and inline keyboards
- DB-backed session state for reliable flow handling
- Admin tools inside bot:
  - vacancy list and enable/disable
  - application list and candidate card
  - status updates
  - internal notes
- Modular folder structure for scaling

## Tech stack

- Node.js + TypeScript
- Telegraf
- Express
- Prisma
- PostgreSQL

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start in dev mode:
   ```bash
   npm run dev
   ```

## Commands

- `npm run dev` - start bot + API in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run compiled app
- `npm run prisma:generate` - regenerate Prisma client
- `npm run prisma:migrate` - apply migrations

## Environment variables

See `.env.example`:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `ADMIN_TELEGRAM_ID`

## Health check

- `GET /health` -> basic server health

## Seed-ready sample data

You can seed a first vacancy and questions manually or through Prisma Studio:

- Sample vacancy title: `Frontend Developer`
- Sample description:
  - `Build and maintain scalable UI components`
  - `Work with product and design teams`
- Sample questions:
  - `Tell us about your recent frontend project` (TEXT)
  - `Years of professional experience?` (NUMBER)
  - `Portfolio URL` (TEXT)

## Project structure

Clean architecture split by layers:

- `src/bot` - Telegram bot core, handlers, UI, and flow services
- `src/modules` - domain services and repositories
- `src/common` - shared errors, middleware, validators
- `src/config` - env and constants
- `src/db` - Prisma client
- `src/routes` - HTTP routes

## Notes

- The bot keeps track of a "current screen message" in session and edits it whenever possible.
- If edit fails (e.g. message deleted), it safely sends a new one and updates session.
