"use client";

import { Clapperboard, Film, Home, LogOut, Menu, Search, Settings, Star, Trophy, Tv, X, Zap } from "lucide-react";
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
    // Read the non-HttpOnly _auth cookie stamped by proxy — instant, no API call needed
    const authCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("_auth="));
    const authRole = authCookie ? authCookie.split("=")[1] : null;

    if (!authRole) {
      // Not logged in — stop checking immediately
      setUser(null);
      setIsAuthChecking(false);
      return;
    }

    // Logged in — show placeholder "My Account" instantly, then fetch full profile
    setUser({ name: "My Account", email: "", image: null, role: authRole.toUpperCase() });
    setIsAuthChecking(false);

    // Fetch full profile details in background
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
      .catch(() => {
        // Keep showing "My Account" — we know they're logged in from the cookie
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setUser(null);
      // Clear the client-readable auth cookie immediately
      document.cookie = "_auth=; path=/; max-age=0; samesite=lax";
      router.push("/");
      router.refresh();
    }
  };

  const handleContributionMoviesClick = () => {
    if (!user) {
      setIsPremiumPromptOpen(true);
      return;
    }

    router.push("/premium_user/contributions");
  };

  const menu: MenuItem[] = [
    {
      title: "Movies",
      url: "/popular",
      items: [
        {
          title: "Popular Movies",
          description: "Trending films right now",
          icon: <Film className="size-4" />,
          url: "/popular",
        },
        {
          title: "Top Rated Movies",
          description: "Critic and audience favorites",
          icon: <Star className="size-4" />,
          url: "/movies/top-rated",
        },
      ],
    },
    {
      title: "TV Shows",
      url: "/tv/popular-series",
      items: [
        {
          title: "Popular Series",
          description: "Series people are watching now",
          icon: <Tv className="size-4" />,
          url: "/tv/popular-series",
        },
        {
          title: "On TV",
          description: "Browse what is airing now",
          icon: <Zap className="size-4" />,
          url: "/tv/on-tv",
        },
      ],
    },
    {
      title: "More",
      url: "/leaderboard",
      items: [
        {
          title: "Contribute Movie",
          description: "Submit movie contributions",
          icon: <Clapperboard className="size-4" />,
          url: "/premium_user/contributions",
          onClick: handleContributionMoviesClick,
        },
        {
          title: "Leaderboard",
          description: "Top contributors and rankings",
          icon: <Trophy className="size-4" />,
          url: "/leaderboard",
        },
      ],
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/8 bg-[rgba(7,7,22,0.82)] backdrop-blur-xl backdrop-saturate-150",
        className
      )}
    >
      {searchOpen && (
        <div className="absolute inset-0 z-10 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search movies, series, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <button
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="rounded-full p-1 text-slate-400 transition hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {isPremiumPromptOpen ? (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="premium-required-title"
          onClick={() => setIsPremiumPromptOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">Premium Feature</p>
              <h2 id="premium-required-title" className="text-2xl font-semibold tracking-tight">
                You need to be a premium user
              </h2>
              <p className="text-sm leading-6 text-slate-300">
                Contribution Movies is available for premium users. Please log in first.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                onClick={() => setIsPremiumPromptOpen(false)}
              >
                Not now
              </button>
              <button
                type="button"
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-indigo-400"
                onClick={() => router.push(`/login?redirect=${encodeURIComponent("/premium_user/contributions")}`)}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("container mx-auto px-4 py-0 lg:py-0", searchOpen && "invisible")}>
        <nav className="hidden h-14 items-center lg:grid lg:grid-cols-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="group flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 shadow-[0_0_18px_rgba(99,102,241,0.55)]">
                <Clapperboard className="size-4 text-white" />
              </span>
              <span className="bg-linear-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-lg font-black tracking-tight text-transparent">
                CineTube
              </span>
            </Link>
          </div>

          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item, pathname))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/8 hover:text-white"
            >
              <Search className="size-4" />
            </button>

            <ThemeToggle className="size-8 border-white/12 bg-white/6 text-slate-300 shadow-none transition hover:bg-white/12 hover:text-white" />

            <div className="mx-1 h-5 w-px bg-white/10" />

            {isAuthChecking ? (
              <div className="h-8 w-28 rounded-full border border-white/10 bg-white/5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-2 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/12 hover:text-white">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs bg-indigo-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="pr-1 text-xs font-semibold">My Account</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 border-white/12 bg-slate-900/95 text-slate-100 backdrop-blur-xl">
                  <div className="px-1.5 py-1">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-300">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => router.push("/user/dashboard")} className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/change-password")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Earnings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-300 focus:text-red-200">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold text-slate-300 transition hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="inline-flex h-8 items-center rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition hover:from-indigo-500 hover:to-violet-500"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="flex h-14 items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-violet-600 shadow-[0_0_14px_rgba(99,102,241,0.5)]">
              <Clapperboard className="size-3.5 text-white" />
            </span>
            <span className="bg-linear-to-r from-white to-indigo-200 bg-clip-text text-base font-black tracking-tight text-transparent">
              CineTube
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:text-white"
            >
              <Search className="size-4" />
            </button>

            <ThemeToggle className="size-8 border-white/12 bg-white/6 text-slate-300 shadow-none transition hover:bg-white/12 hover:text-white" />

            <Sheet>
              <SheetTrigger
                render={
                  <button className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:text-white">
                    <Menu className="size-5" />
                  </button>
                }
              />

              <SheetContent
                side="right"
                className="w-70 border-l border-white/8 bg-[rgba(7,7,22,0.97)] p-0 backdrop-blur-xl"
              >
                <SheetHeader className="border-b border-white/8 px-5 py-4">
                  <SheetTitle>
                    <Link href="/" className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-violet-600">
                        <Clapperboard className="size-3.5 text-white" />
                      </span>
                      <span className="bg-linear-to-r from-white to-indigo-200 bg-clip-text text-base font-black text-transparent">
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

                <div className="absolute bottom-0 left-0 right-0 space-y-2 border-t border-white/8 px-4 py-4">
                  {isAuthChecking ? (
                    <div className="h-20 w-full rounded-2xl border border-white/10 bg-white/5" />
                  ) : user ? (
                    <>
                      <button
                        onClick={() => router.push("/user/dashboard")}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                      >
                        <Home className="h-4 w-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => router.push("/change-password")}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button className="inline-flex h-9 w-full items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                        Earnings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push("/login")}
                        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => router.push("/signup")}
                        className="inline-flex h-9 w-full items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:from-indigo-500 hover:to-violet-500"
                      >
                        Sign up
                      </button>
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

const renderMenuItem = (item: MenuItem, pathname: string) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="h-9 rounded-full border border-transparent bg-transparent px-4 text-sm font-semibold text-slate-300 transition hover:border-white/10 hover:bg-white/8 hover:text-white data-[state=open]:border-white/12 data-[state=open]:bg-white/10 data-[state=open]:text-white">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-72 gap-1 p-2.5">
            {item.items.map((sub) => (
              <li key={sub.title}>
                <NavigationMenuLink
                  href={sub.url}
                  onClick={(event) => {
                    if (!sub.onClick) {
                      return;
                    }

                    event.preventDefault();
                    sub.onClick();
                  }}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm transition duration-200 hover:border-white/10 hover:bg-white/6",
                    pathname === sub.url
                      ? "border-indigo-400/20 bg-indigo-500/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "text-slate-200"
                  )}
                >
                  {sub.icon ? (
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border transition",
                        pathname === sub.url
                          ? "border-indigo-400/25 bg-indigo-400/12 text-indigo-200"
                          : "border-white/10 bg-white/5 text-indigo-300 group-hover:border-white/14 group-hover:bg-white/8"
                      )}
                    >
                      {sub.icon}
                    </span>
                  ) : null}
                  <div className="space-y-1">
                    <p className="font-semibold leading-none tracking-tight">{sub.title}</p>
                    {sub.description ? <p className="text-xs leading-5 text-slate-400">{sub.description}</p> : null}
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
        onClick={(event) => {
          if (!item.onClick) {
            return;
          }

          event.preventDefault();
          item.onClick();
        }}
        className={cn(
          "inline-flex h-8 items-center rounded-full px-3.5 text-xs font-semibold transition hover:bg-white/8 hover:text-white",
          pathname === item.url ? "text-indigo-300" : "text-slate-300"
        )}
      >
        {item.icon ? <span className="mr-1.5 text-indigo-400">{item.icon}</span> : null}
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem, pathname: string) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b border-white/6">
        <AccordionTrigger className="px-2 py-2.5 text-sm font-semibold text-slate-300 hover:text-white">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="pb-1">
          {item.items.map((sub) => (
            <Link
              key={sub.title}
              href={sub.url}
              onClick={(event) => {
                if (!sub.onClick) {
                  return;
                }

                event.preventDefault();
                sub.onClick();
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-white/8",
                pathname === sub.url ? "text-indigo-300" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {sub.icon ? <span className="text-indigo-400">{sub.icon}</span> : null}
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
      onClick={(event) => {
        if (!item.onClick) {
          return;
        }

        event.preventDefault();
        item.onClick();
      }}
      className={cn(
        "block rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-white/8",
        pathname === item.url ? "text-indigo-300" : "text-slate-300 hover:text-white"
      )}
    >
      <span className="inline-flex items-center gap-2">
        {item.icon ? <span className="text-indigo-400">{item.icon}</span> : null}
        {item.title}
      </span>
    </Link>
  );
};

export { Navbar };
