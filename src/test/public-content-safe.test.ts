import { afterEach, describe, expect, it, vi } from "vitest";
import { createPublicDb } from "@/lib/public-db";
import { emptySiteContent, withPublicFallback } from "@/lib/public-content-safe";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("Public deployment recovery", () => {
  it("constructs a public client with server and build settings absent", () => {
    for (const key of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"]) vi.stubEnv(key, "");
    expect(() => createPublicDb()).not.toThrow();
  });
  it("returns safe empty content after a rejected public request", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await withPublicFallback(async () => { throw new Error("Content service offline"); }, emptySiteContent);
    expect(result.settings).toBeNull();
    expect(result.services).toEqual([]);
    expect(result.pricing).toEqual([]);
  });
  it("preserves successful content", async () => {
    expect(await withPublicFallback(async () => "available", () => "fallback")).toBe("available");
  });
});