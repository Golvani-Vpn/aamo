import { describe, it, expect } from "vitest";
import { Workspace, WorkspacePathError } from "../../src/projects/workspace.js";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

describe("Workspace sandbox", () => {
  it("rejects path traversal attempts", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "aab-test-"));
    const workspace = new Workspace(root, "user1", "proj1");
    await workspace.ensure();
    expect(() => workspace.resolve("../../../etc/passwd")).toThrow(WorkspacePathError);
    expect(() => workspace.resolve("../../outside.txt")).toThrow(WorkspacePathError);
  });

  it("allows normal relative paths within the project", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "aab-test-"));
    const workspace = new Workspace(root, "user1", "proj1");
    await workspace.ensure();
    await workspace.writeFile("app/src/main/Foo.kt", "class Foo");
    const content = await workspace.readFile("app/src/main/Foo.kt");
    expect(content).toBe("class Foo");
  });

  it("rejects unsafe user/project identifiers", () => {
    expect(() => new Workspace("/tmp", "../evil", "proj1")).toThrow(WorkspacePathError);
  });
});
