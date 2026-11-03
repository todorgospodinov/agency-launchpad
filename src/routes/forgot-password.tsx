import { createFileRoute } from "@tanstack/react-router";
import { AccountForm } from "@/components/auth/AccountForm";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/forgot-password")({ head: () => pageHead("Password recovery", "Request a password reset for your Real News Agency account."), component: () => <AccountForm mode="forgot" /> });