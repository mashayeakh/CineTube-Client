"use client";

import { Book, Clapperboard, Home, LogOut, Menu, Search, Settings, Sunset, X, Zap } from "lucide-react";
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
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
};

type CurrentUser = {
  name: string;
  email: string;
  image?: string | null;
};

const Navbar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [lang, setLang] = React.useState<"en" | "bn">("en");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!baseUrl) {
          setUser(null);
          return;
        }

        const res = await fetch(`${baseUrl}/auth/user/profile`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const payload = await res.json();
        const profile = payload?.result;

        if (!profile) {
          setUser(null);
          return;
        }

        setUser({
          name: profile.name,
          email: profile.email,
          image: profile.image,
        });
      } catch {
        setUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };

    void checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  const t = translations[lang];

  const menu: MenuItem[] = [
    {
      title: t.menu.movies,
      url: "#",
      items: [
        {
          title: "Popular",
          description: "Trending films right now",
          icon: <Zap className="size-4" />,
          url: "/movie/popular",
        },
        {
          title: "Upcoming",
          description: "Coming soon to theatres",
          icon: <Clapperboard className="size-4" />,
          url: "/movie/upcoming",
        },
        {
          title: "Top Rated",
          description: "All-time highest rated",
          icon: <Sunset className="size-4" />,
          url: "#",
        },
      ],
    },
    {
      title: t.menu.series,
      url: "#",
      items: [
        {
          title: "Popular",
          description: "Trending series",
          icon: <Zap className="size-4" />,
          url: "#",
        },
        {
          title: "On TV",
          description: "Currently airing",
          icon: <Zap className="size-4" />,
          url: "#",
        },
        {
          title: "Top Rated",
          description: "Fan favourites",
          icon: <Sunset className="size-4" />,
          url: "#",
        },
      ],
    },
    { title: t.menu.people, url: "#" },
    {
      title: t.menu.more,
      url: "#",
      items: [
        {
          title: "Join Community",
          description: "Connect with cinephiles",
          icon: <Book className="size-4" />,
          url: "#",
        },
        {
          title: "Leaderboard",
          description: "Top reviewers",
          icon: <Book className="size-4" />,
          url: "#",
        },
        {
          title: "Guidelines",
          description: "Community rules",
          icon: <Sunset className="size-4" />,
          url: "#",
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

            <button
              onClick={() => setLang((prev) => (prev === "en" ? "bn" : "en"))}
              className="inline-flex h-8 items-center rounded-full border border-white/12 bg-white/6 px-3 text-xs font-medium text-slate-300 transition hover:bg-white/12 hover:text-white"
            >
              {lang === "en" ? "বাংলা" : "EN"}
            </button>

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
                  {t.auth.login}
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="inline-flex h-8 items-center rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition hover:from-indigo-500 hover:to-violet-500"
                >
                  {"signup" in t.auth ? t.auth.signup : "Sign up"}
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
                  <button
                    onClick={() => setLang((prev) => (prev === "en" ? "bn" : "en"))}
                    className="inline-flex h-9 w-full items-center justify-center rounded-full border border-white/12 bg-white/6 text-xs font-medium text-slate-300 transition hover:bg-white/12 hover:text-white"
                  >
                    {lang === "en" ? "বাংলা" : "English"}
                  </button>

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
                        {t.auth.login}
                      </button>
                      <button
                        onClick={() => router.push("/signup")}
                        className="inline-flex h-9 w-full items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:from-indigo-500 hover:to-violet-500"
                      >
                        {"signup" in t.auth ? t.auth.signup : "Sign up"}
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
        <NavigationMenuTrigger className="h-8 rounded-full bg-transparent px-3.5 text-xs font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white data-[state=open]:bg-white/8 data-[state=open]:text-white">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-52 gap-0.5 p-2">
            {item.items.map((sub) => (
              <li key={sub.title}>
                <NavigationMenuLink
                  href={sub.url}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/8",
                    pathname === sub.url ? "bg-indigo-500/15 text-indigo-300" : "text-slate-300"
                  )}
                >
                  {sub.icon ? <span className="mt-0.5 shrink-0 text-indigo-400">{sub.icon}</span> : null}
                  <div>
                    <p className="font-semibold leading-none">{sub.title}</p>
                    {sub.description ? <p className="mt-0.5 text-xs text-slate-500">{sub.description}</p> : null}
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
        className={cn(
          "inline-flex h-8 items-center rounded-full px-3.5 text-xs font-semibold transition hover:bg-white/8 hover:text-white",
          pathname === item.url ? "text-indigo-300" : "text-slate-300"
        )}
      >
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
      className={cn(
        "block rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:bg-white/8",
        pathname === item.url ? "text-indigo-300" : "text-slate-300 hover:text-white"
      )}
    >
      {item.title}
    </Link>
  );
};

export { Navbar };
