import { createFileRoute } from "@tanstack/react-router";
import { handleEditorialAssistant } from "@/lib/editorial-assistant.server";

export const Route = createFileRoute("/api/editorial-assistant")({
  server: { handlers: { POST: ({ request }) => handleEditorialAssistant(request) } },
});