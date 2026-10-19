import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { messages } from "@/i18n";
import { auth } from "@/lib/auth";

interface LoginPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect("/calendar");

  const resolvedParams = searchParams ? await searchParams : undefined;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-heading text-3xl font-semibold tracking-tight">
            {messages.auth.title}
          </p>
          <p className="text-sm text-muted-foreground">{messages.auth.subtitle}</p>
        </div>
        <LoginForm initialError={resolvedParams?.error} />
      </div>
    </main>
  );
}
