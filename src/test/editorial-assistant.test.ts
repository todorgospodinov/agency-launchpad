import { describe, expect, it, vi } from "vitest";
import { assertEditorialAdmin, editorialInput } from "@/lib/editorial-assistant";

describe("Admin editorial assistant", () => {
  it("allows a verified administrator", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(assertEditorialAdmin({ rpc }, "admin-id")).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith("has_role", { _user_id: "admin-id", _role: "admin" });
  });
  it("denies an ordinary signed-in user", async () => {
    await expect(assertEditorialAdmin({ rpc: vi.fn().mockResolvedValue({ data: false, error: null }) }, "user-id")).rejects.toThrow("Administrator access is required.");
  });
  it("fails closed when role verification fails", async () => {
    await expect(assertEditorialAdmin({ rpc: vi.fn().mockResolvedValue({ data: true, error: new Error("unavailable") }) }, "user-id")).rejects.toThrow();
  });
  it("supports both writing and review", () => {
    expect(editorialInput.parse({ task: "draft", text: "Source notes" }).task).toBe("draft");
    expect(editorialInput.parse({ task: "review", text: "Story to review" }).task).toBe("review");
    expect(editorialInput.safeParse({ task: "publish", text: "Story" }).success).toBe(false);
  });
});