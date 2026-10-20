"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Sparkles } from "lucide-react";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { messages } from "@/i18n";
import { cn } from "cn";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
}) {
  const pathname = usePathname();
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <aside className="hidden w-60 shrink-0 flex-col md:flex">
          <div className="sticky top-6 flex h-[calc(100dvh-3rem)] flex-col rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 px-1 pb-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="font-heading text-base font-semibold">{messages.app.name}</p>
                <p className="text-xs text-muted-foreground">{messages.app.tagline}</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1" aria-label={messages.app.mainNav}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="flex flex-col">
                      {item.label}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.04] to-amber-500/[0.03] p-3 text-xs md:block">
              <div className="flex items-center gap-1.5 font-heading font-semibold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>DayBloom Mind</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                “Mỗi ngày là một hạt mầm mới. Hãy chăm sóc từng khoảnh khắc nở rộ.”
              </p>
            </div>

            <div className="mt-auto space-y-3 border-t border-border pt-4">
              <div className="px-1">
                <p className="truncate text-sm font-medium">{userName || messages.app.name}</p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => void signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="size-4" />
                {messages.app.logout}
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mb-4 flex items-center justify-between gap-3 md:mb-6">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {messages.app.today}
              </p>
              <h1 className="font-heading truncate text-lg font-semibold capitalize sm:text-xl">
                {today}
              </h1>
            </div>

            <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1 md:hidden">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                    aria-label={item.label}
                  >
                    <Icon className="size-4" />
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="min-w-0 flex-1 pb-16 md:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
