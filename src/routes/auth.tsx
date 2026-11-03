import { createFileRoute } from "@tanstack/react-router";
import { AccountForm } from "@/components/auth/AccountForm";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/auth")({ head: () => pageHead("Account sign-in", "Sign in to your Real News Agency account."), component: () => <AccountForm mode="login" /> });