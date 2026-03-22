# Development Workflow & Branching Strategy

This project follows a professional branching and versioning strategy to ensure stability and enable continuous feature development.

## 🌿 Branching Model

We use a "Gitflow-Lite" model with two primary long-lived branches:

1.  **`main` (Production)**: 
    *   Contains the current stable, production-ready code.
    *   Every merge into `main` is tagged with a new version number (e.g., `v1.0.0`).
    *   Deployments to the production environment are triggered from this branch.

2.  **`develop` (Staging/Integration)**:
    *   The primary integration branch for new features and bug fixes.
    *   Once a milestone is complete and tested on `develop`, it is merged into `main` for release.
    *   Deployments to the "Preview" or "Staging" environment are triggered from this branch.

### Feature Branches
*   **Naming Convention**: `feat/phase-[number]-[description]` (e.g., `feat/phase-8-auth`).
*   Created off: `develop`.
*   Merged into: `develop` via Pull Request.

### Hotfix Branches
*   **Naming Convention**: `hotfix/[description]`.
*   Created off: `main`.
*   Merged into: Both `main` and `develop`.

## 🏷️ Versioning (SemVer)

We use [Semantic Versioning](https://semver.org/) for release tags:

*   **MAJOR** (`vX.0.0`): Significant architectural changes or breaking changes.
*   **MINOR** (`v1.X.0`): New features or significant phases (e.g., Milestone 2 completion).
*   **PATCH** (`v1.0.X`): Bug fixes and minor refinements.

## 🚀 Deployment (Vercel)

1.  **Production**: Linked to the `main` branch.
2.  **Preview/Development**: Linked to the `develop` branch. Every push to `develop` or a PR against it creates a preview deployment for testing.
