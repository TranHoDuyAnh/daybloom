"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/i18n";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    const result = await registerAction(values);
    if (!result.ok) {
      toast.error(result.error);
      const fieldErrors = result.fieldErrors ?? {};
      for (const [field, fieldMessages] of Object.entries(fieldErrors)) {
        if (field in values && fieldMessages?.length) {
          form.setError(field as keyof RegisterValues, { message: fieldMessages[0] });
        }
      }
      return;
    }
    toast.success(messages.auth.registerSuccess);
    router.replace("/calendar");
    router.refresh();
  }

  const { isSubmitting, errors } = form.formState;

  return (
    <Card className="border-border shadow-none">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="register-name">{messages.auth.name}</Label>
            <Input
              id="register-name"
              autoComplete="name"
              placeholder={messages.auth.namePlaceholder}
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">{messages.auth.email}</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder={messages.auth.emailPlaceholder}
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">{messages.auth.password}</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...form.register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm">{messages.auth.confirmPassword}</Label>
            <Input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...form.register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {messages.auth.registerSubmit}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {messages.auth.haveAccount}{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {messages.auth.loginLink}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
