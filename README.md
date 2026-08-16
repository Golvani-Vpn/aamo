# APKForge AI Studio

> Advanced Smali IDE, Android Decompiler, Security Auditor & GitHub CI/CD Automated Builder.

## 🚀 GitHub Actions & CI/CD Ready

This repository includes a ready-to-run GitHub Actions workflow located at:
`.github/workflows/main.yml`

### How to build your APK automatically on GitHub:
1. **Push / Export** this project to your GitHub repository.
2. Go to the **Actions** tab on your GitHub repository.
3. You will see the **"Build & Release Android APK"** workflow automatically listed.
4. Click **"Run workflow"** (or simply push any commit) — GitHub will automatically compile your web assets, run Gradle/Capacitor, and generate your `.apk` in the **Artifacts** section for download.

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
