import { describe, it, expect } from "vitest";
import { validateAndroidProject } from "../../src/build/validate.js";
import { Workspace } from "../../src/projects/workspace.js";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

async function makeTempWorkspace(): Promise<Workspace> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "aab-test-"));
  const workspace = new Workspace(root, "test-user", "test-project");
  await workspace.ensure();
  return workspace;
}

describe("validateAndroidProject", () => {
  it("reports missing required files on an empty project", async () => {
    const workspace = await makeTempWorkspace();
    const result = await validateAndroidProject(workspace);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("settings.gradle.kts"))).toBe(true);
  });

  it("passes for a minimally well-formed project", async () => {
    const workspace = await makeTempWorkspace();
    await workspace.writeFile("settings.gradle.kts", "rootProject.name = \"Test\"");
    await workspace.writeFile("build.gradle.kts", "// root");
    await workspace.writeFile(
      "app/build.gradle.kts",
      "android {\n  namespace = \"com.example.test\"\n}\ndependencies {}\n// applicationId = \"com.example.test\"\napplicationId = \"com.example.test\""
    );
    await workspace.writeFile(
      "app/src/main/AndroidManifest.xml",
      "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"></manifest>"
    );
    const result = await validateAndroidProject(workspace);
    expect(result.ok).toBe(true);
  });

  it("flags unbalanced braces in Kotlin files", async () => {
    const workspace = await makeTempWorkspace();
    await workspace.writeFile("app/src/main/java/Broken.kt", "fun broken() {\n  val x = 1\n");
    const result = await validateAndroidProject(workspace);
    expect(result.issues.some((i) => i.message.includes("Unbalanced braces"))).toBe(true);
  });
});
