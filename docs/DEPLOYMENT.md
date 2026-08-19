# Deployment

1. Fork the repository.
2. Open Settings → Pages and select GitHub Actions.
3. Run `Deploy Builder to GitHub Pages`.
4. Open the URL displayed by the workflow. For a normal repository it is `https://USER.github.io/REPOSITORY/`.
5. Enter your own AI API key in the builder.
6. Enter your fork owner/repository and a fine-grained GitHub token with Contents read/write access.
7. Generate and push an Android project.
8. The `Build Android APK` workflow runs automatically and publishes the APK as an artifact and, on `main`, a Release.
