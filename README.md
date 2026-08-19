# AI Android App Builder

A backendless, GitHub-native Android app builder. The user opens the GitHub Pages Builder, chooses an AI provider, pastes their own API key, chats with the coding agent, connects a GitHub repository with a fine-grained token, and pushes the generated Android project. GitHub Actions then builds a real debug APK.

## User flow

1. Open the deployed **GitHub Pages** site.
2. In **Build Workspace**, choose **Gemini, ChatGPT/OpenAI, Claude, or DeepSeek**.
3. Paste the user's own API key.
4. Enter GitHub owner, repository, and a fine-grained token with repository contents write access.
5. Click **Connect GitHub**.
6. Chat with the AI to create or modify the Android project.
7. Click **Push & Build APK**. The push is an atomic Git commit and changing `generated-app/**` automatically starts `.github/workflows/build-android.yml`.
8. Open the workflow to see the build. The APK is uploaded as the `android-debug-apk` artifact.

## No backend

There is no application backend, database, Docker service, or worker. AI calls and GitHub API calls happen directly from the user's browser. Secrets are not committed to the repository.

## Supported AI providers

- Google Gemini
- ChatGPT / OpenAI
- Anthropic Claude
- DeepSeek

## GitHub token

Use a fine-grained GitHub token limited to the target repository. Repository **Contents: Read and write** is required for pushing. The workflow itself starts from the repository push, so no server-side GitHub credential is needed.

## Android build

GitHub Actions installs Java 17, Android SDK 35, and Gradle 8.7, then runs `assembleDebug` in `generated-app` and uploads the resulting APK.
