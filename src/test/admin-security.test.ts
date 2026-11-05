import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const initial = readFileSync("drizzle/migrations/0000_migration.sql", "utf8");
const removal = readFileSync("drizzle/migrations/0002_manual_admin_only.sql", "utf8");

describe("Manual administrator security", () => {
  it("removes the publicly callable administrator grant function", () => {
    expect(removal).toMatch(/DROP FUNCTION IF EXISTS public\.claim_first_admin\(\)/);
  });

  it("denies authenticated accounts permission to assign roles", () => {
    expect(removal).toMatch(/REVOKE INSERT, UPDATE, DELETE ON public\.user_roles FROM authenticated/);
    expect(removal).not.toMatch(/GRANT (?:ALL|INSERT|UPDATE|DELETE)[^;]*TO authenticated/);
  });

  it("denies anonymous accounts access to role records", () => {
    expect(removal).toMatch(/REVOKE ALL ON public\.user_roles FROM anon/);
  });

  it("enforces newsroom writes using separate protected roles", () => {
    expect(initial).toMatch(/policy "Admins update all"[\s\S]*?using \(public\.has_role\(auth\.uid\(\), 'admin'\)\)/);
    expect(initial).toMatch(/policy "Admins delete all"[\s\S]*?using \(public\.has_role\(auth\.uid\(\), 'admin'\)\)/);
  });
});