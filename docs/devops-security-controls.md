# DevOps & Security Controls — Luv-Films

Prepared for Microsoft DevOps Consulting Practice audit evidence.
Status as of this document's PR (branch `feature/github-security-governance`).

Each control is labeled one of: **IMPLEMENTED**, **MANUAL CONFIGURATION**
(requires a human to click a setting in GitHub/Azure), **LICENSING BLOCKED**,
or **PLANNED** (designed but not yet applied).

## 1. GitHub source control
**IMPLEMENTED.** Repository `IFI-Techsolutions-Limited/Luv-Films` on GitHub,
default branch `main`.

## 2. Pull-request development model
**IMPLEMENTED** in practice (both existing commits to `main` were merged via
PR #1 and #2). **MANUAL CONFIGURATION** to enforce: no branch protection
rule currently exists on `main`, so direct pushes are technically still
possible. See Section 16 (Branch governance).

## 3. PR validation
**IMPLEMENTED** (this PR). `.github/workflows/pr-validation.yml` runs on
every pull request targeting `main`: checkout, Node.js 22 setup, `npm ci`,
and `node --check server.js`. It intentionally does not invoke `npm test`,
since `package.json`'s test script is a placeholder
(`"Error: no test specified"`) — running it would only produce a
permanently red, meaningless check. No `continue-on-error`, `|| true`,
`exit 0`, or `CI=false` is used anywhere in this workflow.

## 4. Node.js 22
**IMPLEMENTED.** Both the deployment workflow and the new PR validation
workflow pin `NODE_VERSION: "22.x"`.

## 5. Deterministic `npm ci`
**IMPLEMENTED.** Both workflows use `npm ci` (not `npm install`) against the
committed `package-lock.json`.

## 6. Committed `package-lock.json`
**IMPLEMENTED.** Present at repository root and used by both workflows via
`cache-dependency-path: package-lock.json`.

## 7. GitHub Actions CI/CD
**IMPLEMENTED.** `.github/workflows/azure-app-service.yml` (pre-existing,
unmodified by this PR) builds and deploys on push to `main`. New workflows
added by this PR: `pr-validation.yml`, `codeql.yml`, `dependency-review.yml`.

## 8. GitHub Environments
**IMPLEMENTED.** Two environments exist: `development` and `production`,
each with 4 environment variables (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
`AZURE_SUBSCRIPTION_ID`, `AZURE_WEBAPP_NAME`). Neither environment stores
secrets — all Azure auth is via OIDC.

**Finding:** at the time of this audit, the `production` environment's
variable values are identical to `development`'s (same subscription,
tenant, client ID, and web app name). Production is not yet a distinct,
independently deployable target, and has no required reviewers or wait
timer configured. Production is **PLANNED**, not implemented — see
Section 19.

## 9. Azure OIDC authentication
**IMPLEMENTED** for development. `azure-app-service.yml`'s `deploy` job
uses `azure/login@v2` with `client-id` / `tenant-id` / `subscription-id`
sourced from GitHub Environment variables (`vars.*`), and declares
`permissions: { contents: read, id-token: write }`. No client secret or
publish profile is present anywhere in the workflow or repository.

The OIDC subject GitHub issues for this deployment is environment-scoped,
per GitHub's documented federated-credential subject format for a job
that declares `environment: development`:

```
repo:IFI-Techsolutions-Limited/Luv-Films:environment:development
```

and, once production deploys are wired up:

```
repo:IFI-Techsolutions-Limited/Luv-Films:environment:production
```

This is the exact subject that must be registered on the corresponding
Azure AD App Registration's federated credential — it is derived directly
from the workflow's own `environment:` binding, not guessed.

## 10. Least-privilege Azure access
**IMPLEMENTED** at the workflow level (explicit `permissions:` blocks,
OIDC-only, no standing credentials). Actual Azure RBAC role scope assigned
to the app registration/service principal is **MANUAL CONFIGURATION** —
verify in Azure Portal that the identity used has only the minimum role
(e.g. `Website Contributor` scoped to the target App Service / resource
group) rather than a broad subscription-level role. Not verifiable from
GitHub alone.

## 11. Azure App Service deployment
**IMPLEMENTED** for development (verified GREEN: build + deploy both
passed in the most recent run). Production deployment is **PLANNED**
(explicitly not triggered by this work, per instructions).

## 12. Dependabot
**PARTIALLY IMPLEMENTED / MANUAL CONFIGURATION REQUIRED.**
`.github/dependabot.yml` is added by this PR, configuring weekly updates
for both the `npm` and `github-actions` ecosystems with grouping for
minor/patch npm updates and all GitHub Actions updates.

**Finding:** the repository's Dependabot **alerts** setting is nominally
enabled, but non-functional — GitHub reports "Dependabot alerts are
inactive" because **Dependency graph** is currently disabled in
Settings → Advanced Security. Enabling Dependency graph is a one-click
**MANUAL CONFIGURATION** step (Settings → Advanced Security → Dependency
graph → Enable) required before Dependabot alerts or the new
`dependabot.yml` version-update schedule can actually surface CVE data or
open PRs.

## 13. CodeQL status
**IMPLEMENTED (workflow added), scan results PENDING first run.**
`.github/workflows/codeql.yml` added by this PR, targeting
`javascript-typescript`, running on push/PR to `main` and weekly on a
schedule, using `github/codeql-action@v4` (v3 is being deprecated
December 2026, so v4 was used to avoid a near-term forced migration).
No `continue-on-error` is used; a failing CodeQL run will fail the check.

This repository is **not** licensing-blocked: Settings → Advanced
Security → CodeQL analysis shows an active "Set up" control (not a
paywall/upgrade prompt), confirming GitHub Advanced Security is available
for this private repository on the org's current plan.

## 14. Dependency Review status
**IMPLEMENTED (workflow added), results PENDING first PR run.**
`.github/workflows/dependency-review.yml` added by this PR, using
`actions/dependency-review-action@v5` on `pull_request` events targeting
`main`. Not licensing-blocked (same plan as CodeQL, above).

## 15. CODEOWNERS
**MANUAL CONFIGURATION REQUIRED.** `.github/CODEOWNERS` existed already
but contained only commented-out example placeholders — no active
ownership. This PR documents the exact paths that need real owners
(`*`, `.github/workflows/`, `.github/dependabot.yml`, `.github/CODEOWNERS`,
`package.json`, `package-lock.json`) but cannot assign real GitHub
usernames or teams, since none were confirmed. **A repository admin must
replace the `REPLACE_WITH_...` placeholders with real `@username` or
`@IFI-Techsolutions-Limited/team-name` values and uncomment those lines**
before "Require review from Code Owners" can be safely enabled in branch
protection.

## 16. Branch governance
**PLANNED / MANUAL CONFIGURATION.** No branch protection rule or ruleset
currently exists on `main`. This PR proposes (but per instructions does
not apply without explicit approval) the following ruleset for `main`:
pull request required before merge, at least 1 approval, require
conversation resolution, require the "PR Validation" status check,
prevent force pushes, prevent branch deletion, and (once CODEOWNERS has
real owners) require CODEOWNERS review. CodeQL and Dependency Review are
intentionally **not** proposed as required checks yet — see caveat in the
final report.

## 17. GitHub Copilot governance
**IMPLEMENTED.** `.github/copilot-instructions.md` (pre-existing stack/
architecture guidance) extended by this PR with an explicit governance
section: Node 22 + npm ci only, PR-based workflow, OIDC-only Azure auth
(no client secrets/publish profiles), least-privilege permissions, no
hardcoded credentials, dependency/security scanning expectations, and an
explicit instruction to never suppress genuine CI failures or use
`--force`/`--legacy-peer-deps` without justification.

## 18. Secret management
**IMPLEMENTED** in the sense that no secrets were found committed to the
repository (targeted review of `config/key.js`, `.env.example`,
`.gitignore`, and a repository-wide code search turned up no hardcoded
credentials — `.env`/`.env.*` are gitignored, `.env.example` contains only
a placeholder key name, and Azure auth uses OIDC with no secret at rest).
GitHub's own code-search index was still building for this newly created
repository at the time of review, so this should be re-verified once
indexing completes. **Secret Scanning and Push Protection are available on
this plan but currently disabled** — enabling them is **MANUAL
CONFIGURATION** (Settings → Advanced Security → Secret Protection →
Enable) and is recommended as defense in depth.

## 19. Development/production separation
**PARTIALLY IMPLEMENTED.** Two distinct GitHub Environments exist, which
is the correct mechanism for separation. However, as noted in Section 8,
`production`'s variables currently duplicate `development`'s values
rather than pointing at a genuinely separate Azure Web App / tenant
scope. Treat production as **PLANNED, not ready** until a repository/Azure
admin provisions distinct production resources and updates the
`production` environment's variables accordingly.

## 20. Approval gates
**PLANNED / MANUAL CONFIGURATION.** Neither environment currently has
required reviewers configured. Recommended: add required reviewers to the
`production` environment once it points at real production resources, so
that a human approves every production deployment. `development` is
reasonably left without a gate, matching its current fast-iteration use.

---

*This document reflects the repository state at the time this PR was
opened. Statuses should be re-verified after any manual configuration
steps listed above are completed, and again after CodeQL/Dependency
Review/PR Validation have each produced at least one real run.*
