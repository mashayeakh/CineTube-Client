"use client";

import { Clapperboard, Film, Home, LogOut, Menu, MessageCircle, Search, Settings, Star, Trophy, Tv, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  items?: MenuItem[];
};

type CurrentUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string;
};

const Navbar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);
  const [isPremiumPromptOpen, setIsPremiumPromptOpen] = React.useState(false);

  React.useEffect(() => {
    const authCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("_auth="));
    const authRole = authCookie ? authCookie.split("=")[1] : null;

    if (!authRole) {
      setUser(null);
      setIsAuthChecking(false);
      return;
    }

    setUser({ name: "My Account", email: "", image: null, role: authRole.toUpperCase() });
    setIsAuthChecking(false);

    fetch("/api/me", { method: "GET", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (profile?.name) {
          setUser({
            name: profile.name,
            email: profile.email,
            image: profile.image ?? null,
            role: typeof profile.role === "string" ? profile.role.toUpperCase() : authRole.toUpperCase(),
          });
        }
      })
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include", cache: "no-store" });
    } finally {
      setUser(null);
      document.cookie = "_auth=; path=/; max-age=0; samesite=lax";
      router.push("/");
      router.refresh();
    }
  };

  const handleContributionMoviesClick = () => {
    if (!user) { setIsPremiumPromptOpen(true); return; }
    router.push("/premium_user/contributions");
  };

  const menu: MenuItem[] = [
    {
      title: "Movies",
      url: "/popular",
      items: [
        { title: "Popular Movies", description: "Trending films right now", icon: <Film className="size-4" />, url: "/popular" },
        { title: "Top Rated Movies", description: "Critic and audience favorites", icon: <Star className="size-4" />, url: "/movies/top-rated" },
      ],
    },
    {
      title: "TV Shows",
      url: "/tv/popular-series",
      items: [
        { title: "Popular Series", description: "Series people are watching now", icon: <Tv className="size-4" />, url: "/tv/popular-series" },
      ],
    },
    { title: "Leaderboard", url: "/leaderboard", icon: <Trophy className="size-4" /> },
  ];

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b backdrop-blur-xl border-slate-200/80 bg-white/80 dark:border-white/[0.06] dark:bg-[rgba(6,6,20,0.85)]", className)}>
      {searchOpen && (
        <div className="absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-3 px-4">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search movies, series, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchOpen(false);
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchOpen(false);
              }
            }}
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder-slate-400 dark:text-white dark:placeholder-slate-500"
          />
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            className="rounded-full p-1 transition text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {isPremiumPromptOpen && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog" aria-modal="true" aria-labelledby="premium-required-title"
          onClick={() => setIsPremiumPromptOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl bg-white border-indigo-100 dark:bg-[#0c0c28] dark:border-indigo-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500 dark:text-indigo-400">Premium Feature</p>
            <h2 id="premium-required-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              You need to be a premium user
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Contribution Movies is available for premium users. Please log in first.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-full border px-4 py-2 text-sm transition border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.08]"
                onClick={() => setIsPremiumPromptOpen(false)}
              >Not now</button>
              <button
                type="button"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                onClick={() => router.push(`/login?redirect=${encodeURIComponent("/premium_user/contributions")}`)}
              >Go to Login</button>
            </div>
          </div>
        </div>
      )}

      <div className={cn("container mx-auto px-4 py-0 lg:py-0", searchOpen && "invisible")}>
        {/* ── Desktop nav ── */}
        <nav className="hidden h-14 items-center lg:grid lg:grid-cols-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="group flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_18px_rgba(99,102,241,0.45)]">
                <Clapperboard className="size-4 text-white" />
              </span>
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-lg font-black tracking-tight text-transparent dark:from-white dark:via-indigo-200 dark:to-violet-300">
                CineTube
              </span>
            </Link>
          </div>

          {/* Center menu */}
          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item, pathname))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right controls */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-full transition text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
            >
              <Search className="size-4" />
            </button>

            <ThemeToggle className="size-8 shadow-none transition text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300" />

            <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/8" />

            {isAuthChecking ? (
              <div className="h-8 w-28 animate-pulse rounded-full bg-slate-100 dark:bg-white/[0.04]" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-2 py-1.5 text-xs font-medium transition focus:outline-none",
                  "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700",
                  "dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200",
                  "data-[state=open]:border-indigo-300 data-[state=open]:bg-indigo-50 data-[state=open]:text-indigo-700",
                  "dark:data-[state=open]:border-indigo-500/30 dark:data-[state=open]:bg-indigo-500/10 dark:data-[state=open]:text-indigo-200"
                )}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs bg-indigo-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="pr-1 text-xs font-semibold">My Account</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className={cn(
                  "w-56 backdrop-blur-xl shadow-xl border",
                  "border-slate-200 bg-white text-slate-700",
                  "dark:border-white/8 dark:bg-[#0d0d26] dark:text-slate-200"
                )}>
                  <div className="px-2 py-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/8" />
                  <DropdownMenuItem onClick={() => router.push("/user/dashboard")} className="cursor-pointer text-slate-600 focus:bg-indigo-50 focus:text-indigo-700 dark:text-slate-300 dark:focus:bg-indigo-500/15 dark:focus:text-indigo-200">
                    <Home className="mr-2 h-4 w-4 text-indigo-500 dark:text-indigo-400" />Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/8" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold transition text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-slate-100"
                >Login</button>
                <button
                  onClick={() => router.push("/signup")}
                  className="inline-flex h-8 items-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition hover:from-indigo-500 hover:to-violet-500"
                >Sign up</button>
              </>
            )}
          </div>
        </nav>

        {/* ── Mobile nav ── */}
        <div className="flex h-14 items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_14px_rgba(99,102,241,0.45)]">
              <Clapperboard className="size-3.5 text-white" />
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-base font-black tracking-tight text-transparent dark:from-white dark:to-indigo-200">
              CineTube
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-full transition text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
            ><Search className="size-4" /></button>

            <ThemeToggle className="size-8 shadow-none transition text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300" />

            <Sheet>
              <SheetTrigger render={
                <button className="inline-flex size-8 items-center justify-center rounded-full transition text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300">
                  <Menu className="size-5" />
                </button>
              } />

              <SheetContent side="right" className="w-72 border-l p-0 backdrop-blur-xl border-slate-200 bg-white/95 dark:border-white/[0.06] dark:bg-[rgba(6,6,20,0.98)]">
                <SheetHeader className="border-b px-5 py-4 border-slate-100 dark:border-white/[0.06]">
                  <SheetTitle>
                    <Link href="/" className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
                        <Clapperboard className="size-3.5 text-white" />
                      </span>
                      <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-base font-black text-transparent dark:from-white dark:to-indigo-200">
                        CineTube
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 px-3 py-4">
                  <Accordion>
                    {menu.map((item) => renderMobileMenuItem(item, pathname))}
                  </Accordion>
                </div>

                <div className="absolute bottom-0 left-0 right-0 space-y-2 border-t px-4 py-4 border-slate-100 dark:border-white/[0.06]">
                  {isAuthChecking ? (
                    <div className="h-20 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
                  ) : user ? (
                    <>
                      {[
                        { label: "Dashboard", icon: <Home className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />, href: "/user/dashboard" },
                        { label: "Settings", icon: <Settings className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />, href: "/change-password" },
                      ].map(({ label, icon, href }) => (
                        <button key={label} onClick={() => router.push(href)} className={mobileAuthBtnClass}>
                          {icon}{label}
                        </button>
                      ))}
                      <button className={mobileAuthBtnClass}>Earnings</button>
                      <button
                        onClick={handleLogout}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold transition border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/[0.06] dark:text-red-400 dark:hover:bg-red-500/15"
                      >
                        <LogOut className="h-4 w-4" />Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => router.push("/login")} className={mobileAuthBtnClass}>Login</button>
                      <button
                        onClick={() => router.push("/signup")}
                        className="inline-flex h-9 w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:from-indigo-500 hover:to-violet-500"
                      >Sign up</button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

// Shared mobile auth button
const mobileAuthBtnClass = cn(
  "inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold transition",
  "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
  "dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
);

// ─── Desktop renderer ──────────────────────────────────────────────────────────

const renderMenuItem = (item: MenuItem, pathname: string) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger
          className={cn(
            "h-9 rounded-full border bg-transparent px-4 text-sm font-semibold transition-all duration-200",
            "border-transparent text-slate-600",
            "hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
            "data-[state=open]:border-indigo-200 data-[state=open]:bg-indigo-50 data-[state=open]:text-indigo-700",
            "dark:text-slate-400",
            "dark:hover:border-indigo-500/25 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200",
            "dark:data-[state=open]:border-indigo-500/30 dark:data-[state=open]:bg-indigo-500/12 dark:data-[state=open]:text-indigo-200",
            pathname.startsWith(item.url)
              ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-200"
              : ""
          )}
        >
          {item.title}
        </NavigationMenuTrigger>

        <NavigationMenuContent>
          <ul className={cn(
            "grid w-72 gap-1 p-2.5 rounded-xl border shadow-xl",
            "bg-white border-slate-200 shadow-slate-200/50",
            "dark:bg-[#0d0d26] dark:border-white/[0.07] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
          )}>
            {item.items.map((sub) => (
              <li key={sub.title}>
                <NavigationMenuLink
                  href={sub.url}
                  onClick={(e) => { if (!sub.onClick) return; e.preventDefault(); sub.onClick(); }}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm transition-all duration-200",
                    pathname === sub.url
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/12 dark:text-indigo-200"
                      : "text-slate-600 hover:border-indigo-100 hover:bg-indigo-50/70 hover:text-slate-800 dark:text-slate-400 dark:hover:border-indigo-500/20 dark:hover:bg-indigo-500/8 dark:hover:text-slate-200"
                  )}
                >
                  {sub.icon && (
                    <span className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200",
                      pathname === sub.url
                        ? "border-indigo-200 bg-indigo-100 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "border-slate-100 bg-slate-50 text-indigo-500 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:border-white/8 dark:bg-white/[0.04] dark:text-indigo-400 dark:group-hover:border-indigo-500/25 dark:group-hover:bg-indigo-500/10"
                    )}>
                      {sub.icon}
                    </span>
                  )}
                  <div className="space-y-1 min-w-0">
                    <p className={cn(
                      "font-semibold leading-none tracking-tight",
                      pathname === sub.url
                        ? "text-indigo-700 dark:text-indigo-200"
                        : "text-slate-700 dark:text-slate-200"
                    )}>
                      {sub.title}
                    </p>
                    {sub.description && (
                      <p className="text-xs leading-5 text-slate-400 dark:text-slate-500">{sub.description}</p>
                    )}
                  </div>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        onClick={(e) => { if (!item.onClick) return; e.preventDefault(); item.onClick(); }}
        className={cn(
          "inline-flex h-9 items-center rounded-full border border-transparent bg-transparent px-4 text-sm font-semibold transition-all duration-200",
          item.title === "Leaderboard"
            ? [
              "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-700",
              "dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/18 dark:hover:border-indigo-500/35 dark:hover:text-indigo-200",
            ]
            : [
              "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-indigo-500/8 dark:hover:text-slate-200",
              pathname === item.url ? "text-indigo-600 dark:text-indigo-300" : "",
            ]
        )}
      >
        {item.icon && <span className="mr-1.5 text-indigo-500 dark:text-indigo-400">{item.icon}</span>}
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

// ─── Mobile renderer ───────────────────────────────────────────────────────────

const renderMobileMenuItem = (item: MenuItem, pathname: string) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b border-slate-100 dark:border-white/[0.05]">
        <AccordionTrigger className="px-2 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-200 data-[state=open]:text-indigo-600 dark:data-[state=open]:text-indigo-300">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="pb-1">
          {item.items.map((sub) => (
            <Link
              key={sub.title}
              href={sub.url}
              onClick={(e) => { if (!sub.onClick) return; e.preventDefault(); sub.onClick(); }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                pathname === sub.url
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/12 dark:text-indigo-300"
                  : "text-slate-500 hover:bg-indigo-50 hover:text-slate-700 dark:hover:bg-indigo-500/8 dark:hover:text-slate-200"
              )}
            >
              {sub.icon && (
                <span className={pathname === sub.url
                  ? "text-indigo-500 dark:text-indigo-400"
                  : "text-indigo-400 dark:text-indigo-500"
                }>{sub.icon}</span>
              )}
              {sub.title}
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link
      key={item.title}
      href={item.url}
      onClick={(e) => { if (!item.onClick) return; e.preventDefault(); item.onClick(); }}
      className={cn(
        "block rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
        pathname === item.url
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/12 dark:text-indigo-300"
          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-indigo-500/8 dark:hover:text-slate-200"
      )}
    >
      <span className="inline-flex items-center gap-2">
        {item.icon && <span className="text-indigo-500 dark:text-indigo-400">{item.icon}</span>}
        {item.title}
      </span>
    </Link>
  );
};

export { Navbar };