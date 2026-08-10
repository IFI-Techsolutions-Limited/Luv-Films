
 Luv Films — GitHub Copilot instructions

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
## Repository governance (read before suggesting CI/CD or infra changes)

This repository has a specific, deliberately-scoped DevOps/security posture. When
suggesting or generating changes to workflows, configuration, or dependencies,
follow these rules:

- **Runtime**: Node.js 22, npm only. Always use `npm ci` (never `npm install`)
  in CI - `package-lock.json` is committed and must stay in sync.
- **Pull-request workflow**: all changes to `main` go through a pull request.
  Direct pushes to `main` are not part of the intended workflow. PR Validation
  (`.github/workflows/pr-validation.yml`) must pass before merge.
- **CI/CD**: GitHub Actions only. The deployment workflow
  (`.github/workflows/azure-app-service.yml`) is production-sensitive -
  do not restructure it casually; open a PR and explain the reasoning.
- **Azure authentication**: GitHub OIDC only (`azure/login@v2` with
  `client-id` / `tenant-id` / `subscription-id` from GitHub Environment
  variables, and `permissions: id-token: write`). Never introduce
  `AZURE_CLIENT_SECRET`, a publish profile, or any other static credential
  as a replacement for OIDC.
- **Environments**: `development` and `production` are separate GitHub
  Environments with separate variables. Do not merge their configuration or
  reuse one environment's credentials/target for the other.
- **Least-privilege permissions**: every workflow/job should declare an
  explicit `permissions:` block scoped to only what it needs
  (e.g. `contents: read`, add `id-token: write` only for the OIDC login step,
  `security-events: write` only for code-scanning uploads). Do not default to
  broad or write-all permissions.
- **No hardcoded credentials**: never suggest embedding secrets, connection
  strings, API keys, or tokens in source, workflow files, or comments. Use
  environment variables / GitHub Environment secrets or variables for runtime
  configuration, matching the existing `.env.example` pattern.
- **Dependency and security scanning**: Dependabot (npm + github-actions),
  CodeQL, and Dependency Review are part of this repository's baseline.
  Do not suggest disabling, weakening, or working around them.
- **Never make CI green by hiding failures**: do not suggest
  `continue-on-error: true`, `|| true`, `exit 0`, `CI=false`, or similar
  patterns to suppress a genuine failing check. If a check fails, fix the
  underlying issue or flag it for a human - do not mask it.
- **Dependency install flags**: never suggest `--force` or
  `--legacy-peer-deps` for `npm install`/`npm ci` unless there is an explicit,
  documented justification from a maintainer for that specific case.
- **Preserve application behavior**: do not change runtime behavior of the
  app solely to make a check pass. Only change behavior when the requested
  feature or fix actually requires it.
- **Test scripts**: `package.json`'s `test` script is currently a placeholder
  (`"Error: no test specified"`). Do not wire it into CI as a real test gate
  until genuine, runnable tests exist - and don't invent fake tests to fill
  the gap.
