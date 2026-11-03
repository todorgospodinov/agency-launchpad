import { createFileRoute } from "@tanstack/react-router";
import { AccountForm } from "@/components/auth/AccountForm";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/login")({ head: () => pageHead("Welcome back", "Access your stories and profile at Real News Agency."), component: () => <AccountForm mode="login" /> });