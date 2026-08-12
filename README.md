# Luv Films Production Application

This repository contains the production-ready Luv Films application code and DevOps configuration. The application is delivered using GitHub-based source control, GitHub Actions CI/CD, DevSecOps controls, and Azure App Service deployment.

## Production Scope

The production repository supports the Luv Films business-critical application hosted on Azure App Service. The solution follows a controlled software delivery model with protected branches, pull request reviews, automated validation, security scanning, deployment approvals, and post-deployment monitoring.

## Technology Stack

- Node.js / React application
- GitHub for source control
- GitHub Actions for CI/CD
- Azure App Service for hosting
- Azure Monitor and Application Insights for monitoring
- GitHub Copilot for developer assistance
- GitHub security controls including CodeQL, Dependabot, Secret Scanning, and Push Protection

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production release branch |
| `develop` | Development integration branch |
| `feature/*` | Feature development branches |

Direct commits to protected branches are not allowed. All changes must go through pull requests and required approvals.

## CI/CD Process

The production delivery process follows this flow:

```text
Feature Branch
→ Pull Request
→ Build Validation
→ Unit / Smoke Tests
→ Security Scanning
→ CODEOWNERS Review
→ Merge to main
→ Production Approval
→ Azure App Service Deployment
→ Post-Deployment Health Check
