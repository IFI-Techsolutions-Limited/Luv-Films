# DevOps & Security Controls — Luv-Films

Prepared for Microsoft DevOps Consulting Practice audit evidence.
Status as of this document's update on branch `feature/github-security-governance` (PR #3), verified live against GitHub on 2026-08-10.

Each control is labeled one of: **IMPLEMENTED**, **MANUAL** (requires a human to click a setting in GitHub/Azure that cannot be safely automated), **BLOCKED**, or **PLANNED** (designed but not yet applied, typically because real production values are not yet available).

## 1. GitHub source control
**IMPLEMENTED.** Repository `IFI-Techsolutions-Limited/Luv-Films` on GitHub, default branch `main`.

## 2. GitHub Actions CI/CD
**IMPLEMENTED.** `.github/workflows/azure-app-service.yml` builds and deploys on push to `main` (and via manual `workflow_dispatch`). Latest run (#7, on `main`) is GREEN — build and deploy both passed. Additional workflows: `pr-validation.yml`, `codeql.yml`, `dependency-review.yml`, all active and passing on the current PR #3 head commit.

## 3. Copilot governance
**IMPLEMENTED.** `.github/copilot-instructions.md` documents Node 22 + npm ci only, PR-based workflow, OIDC-only Azure auth (no client secrets/publish profiles), least-privilege permissions, no hardcoded credentials, dependency/security scanning expectations, and an explicit instruction to never suppress genuine CI failures.

## 4. Node.js 22
**IMPLEMENTED.** The deployment workflow pins `NODE_VERSION: "22.x"`.

## 5. Deterministic `npm ci`
**IMPLEMENTED.** The deployment workflow uses `npm ci` (not `npm install`) against the committed `package-lock.json`.

## 6. Azure OIDC authentication
**IMPLEMENTED** for development. `azure-app-service.yml`'s `deploy` job uses `azure/login@v2` with `client-id` / `tenant-id` / `subscription-id` sourced from GitHub Environment variables (`vars.*`), and declares `permissions: { contents: read, id-token: write }`. No client secret or publish profile is present anywhere in the workflow or repository. This design was verified unchanged this session (file re-read directly from the branch; no edits applied).

## 7. Development environment / deployment pipeline
**IMPLEMENTED.** The `development` GitHub Environment exists with its 4 expected variables (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_WEBAPP_NAME`) confirmed present via live settings (values not printed, per policy). The Azure App Service Dev deployment workflow is confirmed GREEN on its latest run.

## 8. Branch policies (branch protection on `main`)
**IMPLEMENTED.** Verified live on `main`'s branch protection rule:
- Pull request required before merging: yes
- Minimum 1 approval required: yes
- Conversation resolution required: yes
- Required status check: **`Validate`** (the exact job name reported by `.github/workflows/pr-validation.yml`, added and confirmed indexed by GitHub this session)
- Force pushes: blocked
- Branch deletion: blocked
- Require review from Code Owners: enabled (see Section 9)

CodeQL and Dependency Review are intentionally **not** configured as required status checks yet, per governance policy (only PR Validation is required at this stage; CodeQL/Dependency Review can be promoted to required checks after a longer stability track record).

## 9. CODEOWNERS
**IMPLEMENTED.** `.github/CODEOWNERS` now designates `@rachita2901` (the repository's active admin collaborator — confirmed via explicit user direction, since the repository has exactly 2 direct collaborators, both admins, and the organization has 0 teams, so no single owner could be inferred automatically) as owner for: `*`, `.github/`, `.github/workflows/`, `.github/dependabot.yml`, `.github/CODEOWNERS`, `package.json`, `package-lock.json`. Validated via GitHub's own "This CODEOWNERS file is valid" banner. "Require review from Code Owners" is enabled in branch protection (Section 8).

## 10. Pull request reviews
**IMPLEMENTED.** Verified live against open PR #3: PR is required before merge, at least 1 approval is required, conversation resolution is required, the `Validate` status check is required, and Code Owners review is required — all shown as active/blocking "Required" conditions on the PR's merge box, without merging the PR.

## 11. Secret Scanning
**IMPLEMENTED.** Confirmed enabled via Settings → Advanced Security (control shows "Disable", meaning the feature is currently active).

## 12. Push Protection
**IMPLEMENTED.** Confirmed enabled via Settings → Advanced Security (control shows "Disable", meaning the feature is currently active). Blocks commits containing supported secret patterns.

## 13. Dependabot alerts
**IMPLEMENTED.** Confirmed enabled via Settings → Advanced Security (control shows "Disable", meaning the feature is currently active). Dependency graph is also confirmed enabled, which Dependabot alerts depends on.

## 14. Dependency graph
**IMPLEMENTED.** Confirmed enabled via Settings → Advanced Security.

## 15. CodeQL
**IMPLEMENTED.** `.github/workflows/codeql.yml` is active; latest run against PR #3's current head commit (run #3) completed successfully (green check), confirmed via the Actions tab (not inferred from the workflow file alone).

## 16. Dependency Review
**IMPLEMENTED.** `.github/workflows/dependency-review.yml` is active; latest run against PR #3's current head commit (run #3) completed successfully (green check), confirmed via the Actions tab.

## 17. Dependabot vulnerability findings
**TRIAGED, NOT REMEDIATED (by design).** 77 open Dependabot alerts at time of this audit: 6 Critical, 34 High, 25 Moderate, 12 Low. All 6 Critical findings are individually documented with package, dependency type, vulnerable/fixed version, breaking-change risk, and required validation in `docs/dependency-remediation-plan.md`. No dependency has been upgraded; `npm audit fix --force` was not run; no blind/bulk upgrade of mongoose, express, ejs, or nodemailer was performed. Remediation requires separate, explicitly approved follow-up work.

## 18. Production environment
**PLANNED — not implemented.** The `production` GitHub Environment exists with 4 variables (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_WEBAPP_NAME`), but these values are confirmed identical to `development`'s — production does not yet point at a genuinely separate Azure Web App, tenant, or subscription scope. No production deployment has been triggered, and none should be until a repository/Azure admin provisions distinct production resources and updates these variables accordingly. This is an explicit, deliberate decision (confirmed with the repository owner) to document the gap rather than fabricate placeholder production values or silently copy development's values in a way that would misrepresent production as ready.

## 19. Production approval gate
**IMPLEMENTED (gate only; environment itself remains PLANNED).** The `production` environment now has 1 required-reviewer protection rule configured (`@rachita2901`, confirmed via explicit user direction), so any future production deployment will require human approval before running. This does not change the finding in Section 18 — the environment's Azure variables still duplicate development's, so no production deployment should be attempted using them as-is.

## 20. Least-privilege Azure access
**MANUAL — not verifiable from GitHub alone.** Workflow-level least privilege is implemented (explicit `permissions:` blocks, OIDC-only, no standing credentials). Actual Azure RBAC role scope assigned to the app registration/service principal must be verified directly in the Azure Portal (e.g. confirm a `Website Contributor` role scoped to the specific App Service / resource group, not a broad subscription-level role).

---

## Summary of manual actions still required

- Verify Azure RBAC role scope for the OIDC service principal directly in the Azure Portal (Section 20).
- Provision distinct production Azure resources and update the `production` environment's variables once real values are available (Section 18) — do not copy development's values.
- Schedule and execute the dependency remediation plan (`docs/dependency-remediation-plan.md`), starting with the lowest-risk Critical findings (ejs, minimist) before the higher-risk mongoose and nodemailer upgrades.
- Consider promoting CodeQL and Dependency Review to required status checks on `main` once they have a longer track record of stable, non-flaky runs.

*This document reflects live-verified repository and Azure-adjacent GitHub state as of 2026-08-10. No control above is marked IMPLEMENTED without direct verification via GitHub's UI/settings pages in this session or a prior session's equivalently verified state.*
