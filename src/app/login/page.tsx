import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/calendar");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-heading text-3xl font-semibold tracking-tight">DayBloom</p>
          <p className="text-sm text-muted-foreground">
            Lịch cá nhân và sổ tay nhật ký của bạn.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
