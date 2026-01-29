import { downloadAndSaveImage } from "@/lib/imageHelper";
import { loadJsonData } from "@/lib/seedHelpers";
import { UserSeedSchema } from "@/lib/validations/seed";
import fs from "fs/promises";
import { describe, expect, it } from "vitest";

describe("seedHelpers", () => {
  it("validates and loads valid user JSON", async () => {
    const data = [{ id: "u1", name: "Test", email: "test@example.com" }];
    const file = "./tmp-user.json";
    await fs.writeFile(file, JSON.stringify(data));
    const loaded = await loadJsonData(file, UserSeedSchema.array());
    expect(loaded[0].id).toBe("u1");
    await fs.unlink(file);
  });
  it("throws on invalid user JSON", async () => {
    const data = [{ id: 1, name: "", email: "bad" }];
    const file = "./tmp-baduser.json";
    await fs.writeFile(file, JSON.stringify(data));
    await expect(loadJsonData(file, UserSeedSchema.array())).rejects.toThrow();
    await fs.unlink(file);
  });
});

describe("imageHelper", () => {
  it("dedupes by file path", async () => {
    const file = "./tmp-image.jpg";
    await fs.writeFile(file, "fakeimg");
    const rel = await downloadAndSaveImage({
      url: "http://fake",
      destDir: ".",
      filename: "tmp-image.jpg",
      fallback: "fallback.jpg",
      maxRetries: 1,
    });
    expect([rel, rel.replace(/^\.\//, "")]).toContain("tmp-image.jpg");
    await fs.unlink(file);
  });
});
