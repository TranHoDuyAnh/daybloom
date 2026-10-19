"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/i18n";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

interface LoginFormProps {
  initialError?: string;
}

export function LoginForm({ initialError }: LoginFormProps = {}) {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (initialError) {
      if (initialError === "Configuration") {
        toast.error(messages.auth.configError);
      } else if (initialError === "CredentialsSignin") {
        toast.error(messages.auth.invalidCredentials);
      } else {
        toast.error(messages.auth.failed);
      }
    }
  }, [initialError]);

  async function onSubmit(values: LoginValues) {
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        if (result?.error === "Configuration") {
          toast.error(messages.auth.configError);
        } else {
          toast.error(messages.auth.invalidCredentials);
        }
        return;
      }

      router.replace("/calendar");
      router.refresh();
    } catch (error) {
      console.error("[auth] signIn failed:", error);
      toast.error(messages.auth.failed);
    }
  }

  const { isSubmitting, errors } = form.formState;

  return (
    <Card className="border-border shadow-none">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{messages.auth.email}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={messages.auth.emailPlaceholder}
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{messages.auth.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...form.register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            {messages.auth.submit}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {messages.auth.noAccount}{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {messages.auth.registerLink}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
