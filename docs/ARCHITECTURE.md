# Architecture

This version is intentionally backendless.

```text
Mobile Browser
   |
   +--> GitHub Pages frontend
   |       |
   |       +--> User's AI provider (BYO key)
   |       |
   |       +--> GitHub Contents API (BYO fine-grained token)
   |
   +--> GitHub Actions
             |
             +--> Android SDK + Java 17 + Gradle
             |
             +--> APK Artifact / Release
```

No project-owned server, database, VPS, or central AI credential is required.
