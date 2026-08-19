# Troubleshooting

## GitHub Pages is blank
Run the Pages workflow again and make sure GitHub Pages uses **GitHub Actions** as its source.

## AI provider request fails
Check the selected model and API key. Browser-side AI access depends on the provider allowing browser requests. Never put a production-wide credential in the frontend.

## Push to GitHub fails
Use a fine-grained token restricted to the target repository with Contents read/write permission. Confirm owner and repository name.

## APK build fails
Open Actions → Build Android APK and inspect the Gradle log. The workflow uses Java 17, Android SDK 35, and Gradle 8.7.
