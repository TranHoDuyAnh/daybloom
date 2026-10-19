import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { messages } from "@/i18n";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/calendar");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-heading text-3xl font-semibold tracking-tight">
            {messages.auth.registerTitle}
          </p>
          <p className="text-sm text-muted-foreground">{messages.auth.registerSubtitle}</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
