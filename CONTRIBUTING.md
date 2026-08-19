# Contributing

This repository is intentionally backendless. The web app runs on GitHub Pages, AI calls are made from the browser using the user-provided API key, generated files are committed to GitHub through the GitHub Contents/Git Data APIs, and Android APKs are built by GitHub Actions.

## Local development

```bash
npm install
npm run dev --workspace frontend
```

## Build

```bash
npm install
npm run build
```

## Architecture

- `frontend/` — static React/Vite builder.
- `templates/` — starter Android project templates.
- `.github/workflows/pages.yml` — deploys the builder to GitHub Pages.
- `.github/workflows/build-android.yml` — builds `generated-app` with Java 17, Android SDK 35 and Gradle 8.7.

There is no server, database, Docker worker, or project-owned AI credential.
