# AI Android App Builder

A GitHub-native, backendless AI Android app builder. Fork it, deploy the mobile web UI to GitHub Pages, bring your own AI API key, describe an Android app, push the generated project to your fork, and let GitHub Actions build a real APK.

## Architecture

`GitHub Pages frontend → user's AI API → GitHub Contents API → generated-app → GitHub Actions → Android SDK + Gradle → APK`

There is **no project-owned backend, database, VPS, or central AI key**.

## Quick start

1. Fork this repository.
2. In the fork, open **Settings → Pages** and select **GitHub Actions** as the source.
3. Run **Deploy Builder to GitHub Pages** once from **Actions**.
4. Open the Pages URL shown by GitHub. It will normally be `https://YOUR_USER.github.io/YOUR_REPO/`.
5. In the builder, enter your own Gemini, OpenAI, Claude, or DeepSeek key. Keys are kept in browser local storage and are never committed by this app.
6. Enter your GitHub repository owner/name and a fine-grained GitHub token with repository Contents read/write access. This token is used only by your browser to write generated files to your fork.
7. Chat, attach screenshots, and iterate.
8. Press **Push project to GitHub**.
9. GitHub Actions will build `generated-app` and publish the APK as an Artifact and Release.

## Important security note

This is a client-side BYO-key tool. Browser-side AI calls necessarily expose the key to the browser session. Do not use a production credential with broad account permissions. Prefer a restricted API key and rotate it if necessary. Never put API keys in source files or GitHub commits.

The GitHub token should be a fine-grained token restricted to the single repository with Contents read/write. Never use a classic token with broad permissions when a fine-grained token is sufficient.

## What it can build

The builder is intentionally not limited to toy applications. Prompt it for multi-screen applications, APIs, databases, authentication, e-commerce, dashboards, media, education, finance, maps, camera features, notifications, offline storage, multilingual UIs, and other substantial Android products. For services requiring a backend or secret, the generated app can create configurable integration points, but those external services still need to be supplied by the app owner.

## Build pipeline

The included workflow installs Java 17, Android SDK packages, downloads Gradle 8.7, and runs a real `assembleDebug` build. It verifies the APK exists, uploads it as an artifact, and creates a GitHub Release for builds on `main`.

## Limitations

GitHub Pages is static, so it cannot itself execute Android builds. Builds run in GitHub Actions. The browser AI mode also depends on each provider allowing browser requests; if a provider changes browser/CORS policy, use another supported provider or self-host a compatible frontend/proxy.
