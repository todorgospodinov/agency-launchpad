import { createFileRoute } from "@tanstack/react-router";
import { AccountForm } from "@/components/auth/AccountForm";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/register")({ head: () => pageHead("Create an account", "Join Real News Agency as a contributor."), component: () => <AccountForm mode="register" /> });