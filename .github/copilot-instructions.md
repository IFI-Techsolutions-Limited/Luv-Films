# Luv Films — GitHub Copilot instructions

You are assisting developers on the **Luv Films** Node.js authentication web app.

## Stack
- Node.js + Express
- EJS views (`views/`) with `express-ejs-layouts`
- Passport local auth (`config/passport.js`, `config/checkAuth.js`)
- Mongoose / MongoDB (`models/User.js`, `config/key.js` → `process.env.MONGO_URI`)
- Static assets under `assets/`
- Entry point: `server.js` (`npm start`)

## Architecture (from HLD)
- Source: GitHub → GitHub Actions CI/CD → Azure App Service (Dev / Prod)
- Users reach apps via Azure Front Door (dev/prod endpoints)
- Do **not** hardcode secrets (DB URIs, OAuth tokens, API keys). Use environment variables / App Service settings.
- Prefer changes that stay compatible with Azure App Service (`PORT` from `process.env.PORT`).

## Coding guidelines
- Match existing style: CommonJS (`require`/`module.exports`), clear section comments.
- Keep auth flows simple: register/login/logout; no email/OAuth unless explicitly requested.
- Put route handlers in `controllers/`, routes in `routes/`, views in `views/`.
- Do not commit `.env` files. Update `.env.example` when adding new env vars.
- Avoid introducing unused dependencies.

## Security
- Never embed credentials in source.
- Validate user input on register/login/reset.
- Hash passwords with bcryptjs before save.
- Respect existing flash messages and Passport session patterns.

## CI/CD
- Deploy workflow lives in `.github/workflows/azure-app-service.yml`.
- Keep the app startable with `npm start` after `npm ci --omit=dev`.
