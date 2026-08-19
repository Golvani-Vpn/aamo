# Security

This project is backendless. AI and GitHub credentials are entered in the browser and stored only in browser local storage when the user chooses to save them. They are not committed to the repository by the builder.

Use restricted API keys and a fine-grained GitHub token limited to the target repository with Contents read/write permission. Rotate credentials if they are exposed.

GitHub Actions builds generated Android code in an isolated hosted runner. The workflow should not be used to execute arbitrary shell commands supplied by an untrusted prompt; generated projects are built by the normal Gradle build pipeline.
