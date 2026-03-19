"use client";

import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import * as React from "react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";

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

import { cn } from "@/lib/utils";
import { translations } from "@/lib/translations";

// Types
interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

const Navbar = ({ className }: { className?: string }) => {
  // ✅ Language state
  const [lang, setLang] = React.useState<"en" | "bn">("en");

  // ✅ Translation object
  const t = translations[lang];

  // ✅ Menu (NOW dynamic)
  const menu: MenuItem[] = [
    {
      title: t.menu.movies,
      url: "#",
      items: [
        {
          title: "Popular",
          description: "Latest movies",
          icon: <Book className="size-5" />,
          url: "/movie/popular",
        },
        {
          title: "Upcoming",
          description: "Latest movies",
          icon: <Book className="size-5" />,
          url: "#",
        },
        {
          title: "Top Rated",
          description: "Best rated movies",
          icon: <Sunset className="size-5" />,
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
          icon: <Zap className="size-5" />,
          url: "#",
        },
        {
          title: "On Tv",
          description: "Trending series",
          icon: <Zap className="size-5" />,
          url: "#",
        },
        {
          title: "Top Rated",
          description: "Trending series",
          icon: <Zap className="size-5" />,
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
          description: "Latest movies",
          icon: <Book className="size-5" />,
          url: "#",
        },
        {
          title: "Leaderboard",
          description: "Latest movies",
          icon: <Book className="size-5" />,
          url: "#",
        },
        {
          title: "Guildlines",
          description: "Best rated movies",
          icon: <Sunset className="size-5" />,
          url: "#",
        },
      ],
    },
  ];

  return (
    <section
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur",
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">

        {/* Desktop */}
        <nav className="hidden lg:grid lg:grid-cols-3 items-center body-font font-bold">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              CineTube
            </Link>
          </div>

          {/* Menu */}
          <div className="flex justify-center ">
            <NavigationMenu>
              <NavigationMenuList className={"font-bold"}>
                {menu.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side */}
          <div className="flex justify-end items-center gap-2">

            {/* 🌐 Language Switch */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLang((prev) => (prev === "en" ? "bn" : "en"))
              }
            >
              {lang === "en" ? "বাংলা" : "EN"}
            </Button>

            <Button variant="ghost" size="sm">
              {t.auth.login}
            </Button>

            <Button size="sm">{t.auth.signup}</Button>
          </div>
        </nav>

        {/* Mobile */}
        <div className="flex lg:hidden justify-between items-center">

          <Link href="/" className="font-bold text-lg">
            CineTube
          </Link>

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon"><Menu className="size-5" /></Button>} />

            <SheetContent side="right" className="w-75">
              <SheetHeader>
                <SheetTitle>CineTube</SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-4">

                <Accordion >
                  {menu.map((item) => renderMobileMenuItem(item))}
                </Accordion>

                {/* Language Switch */}
                <Button
                  variant="outline"
                  onClick={() =>
                    setLang((prev) => (prev === "en" ? "bn" : "en"))
                  }
                >
                  {lang === "en" ? "বাংলা" : "EN"}
                </Button>

                <Button variant="outline">{t.auth.login}</Button>
                <Button>{t.auth.signup}</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
};

// Desktop menu renderer
const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="font-bold">{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-fit gap-2 p-4 body-font font-bold">
            {item.items.map((sub) => (
              <li key={sub.title}>
                <Link href={sub.url}>{sub.title}</Link>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink render={<Link href={item.url} className="font-bold">{item.title}</Link>}></NavigationMenuLink>
    </NavigationMenuItem>
  );
};

// Mobile menu renderer
const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title}>
        <AccordionTrigger className="font-bold">{item.title}</AccordionTrigger>
        <AccordionContent>
          {item.items.map((sub) => (
            <Link key={sub.title} href={sub.url} className="block py-1">
              {sub.title}
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link key={item.title} href={item.url} className="block py-2 font-bold">
      {item.title}
    </Link>
  );
};

export { Navbar };