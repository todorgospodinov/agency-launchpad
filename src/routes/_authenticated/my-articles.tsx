import { createFileRoute } from "@tanstack/react-router";
import { PersonalArticles } from "@/components/PersonalArticles";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/my-articles")({ head: () => pageHead("My articles", "Your submitted stories at Real News Agency."), component: () => <PersonalArticles /> });