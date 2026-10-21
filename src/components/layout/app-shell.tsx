"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Sparkles, User } from "lucide-react";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] gap-6 px-3 py-3 sm:px-6 sm:py-6">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden w-60 shrink-0 flex-col md:flex">
          <div className="sticky top-6 flex h-[calc(100dvh-3rem)] flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2.5 px-1 pb-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Sparkles className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="font-heading text-base font-semibold">{messages.app.name}</p>
                <p className="text-xs text-muted-foreground">{messages.app.tagline}</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1.5" aria-label={messages.app.mainNav}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
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
                className="w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={() => void signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="size-4" />
                {messages.app.logout}
              </Button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="mb-3 flex items-center justify-between gap-3 md:mb-6">
            {/* Left: Mobile App Title / Desktop Date */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 md:hidden">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="font-heading text-base font-bold text-foreground">
                  {messages.app.name}
                </span>
                <span className="text-xs text-muted-foreground font-serif italic">
                  · {today.split(",")[0]}
                </span>
              </div>

              <div className="hidden md:block">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {messages.app.today}
                </p>
                <h1 className="font-heading truncate text-lg font-semibold capitalize sm:text-xl">
                  {today}
                </h1>
              </div>
            </div>

            {/* Right: Mobile Profile Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setProfileSheetOpen(true)}
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs transition-transform active:scale-95"
                aria-label="Tài khoản"
              >
                <User className="size-4" />
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
        </div>
      </div>

      {/* ================= IPHONE NATIVE BOTTOM NAVIGATION BAR ================= */}
      <nav
        aria-label="Điều hướng chính di động"
        className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-border/80 bg-card/90 px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom,0.75rem),0.5rem)] backdrop-blur-xl shadow-lg md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-all active:scale-95",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* User Account Tab */}
        <button
          type="button"
          onClick={() => setProfileSheetOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-medium text-muted-foreground transition-all active:scale-95 hover:text-foreground"
        >
          <div className="flex size-7 items-center justify-center rounded-full text-muted-foreground">
            <User className="size-4" />
          </div>
          <span className="leading-none">Tài khoản</span>
        </button>
      </nav>

      {/* ================= MOBILE USER PROFILE BOTTOM SHEET ================= */}
      <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pt-4 pb-[max(env(safe-area-inset-bottom,1.5rem),1.25rem)]">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="font-heading text-lg font-semibold">Tài khoản của bạn</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-3.5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <User className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {userName || messages.app.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 justify-center gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-98"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              {messages.app.logout}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
