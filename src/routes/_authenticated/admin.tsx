import { createFileRoute } from "@tanstack/react-router";
import { PersonalArticles } from "@/components/PersonalArticles";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/admin")({ head: () => pageHead("Newsroom", "Manage and review Real News Agency stories."), component: () => <PersonalArticles newsroom /> });