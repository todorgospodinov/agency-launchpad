import { z } from "zod";

export const editorialInput = z.object({
  task: z.enum(["draft", "rewrite", "headlines", "summary", "review"]),
  text: z.string().trim().min(1, "Enter a story or source notes.").max(40000),
  instructions: z.string().trim().max(2000).default(""),
});

export async function assertEditorialAdmin(client: {
  rpc: (name: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: unknown; error: unknown }>;
}, userId: string) {
  const { data, error } = await client.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new Error("Administrator access is required.");
}