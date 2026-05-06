"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Flame, 
  Star, 
  TrendingUp, 
  Trophy, 
  PlusCircle, 
  Tags, 
  MessageSquare, 
  Users 
} from "lucide-react";

const sections = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "popular", label: "Popular", icon: Star },
  { id: "recommend", label: "For You", icon: TrendingUp },
  { id: "leaderboard", label: "Top Users", icon: Trophy },
  { id: "new-releases", label: "New", icon: PlusCircle },
  { id: "genres", label: "Genres", icon: Tags },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "community", label: "Join", icon: Users },
];

export function HomeNavigation() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 hidden lg:block">
      <nav className="flex items-center gap-1 rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-2xl backdrop-blur-md">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "group relative flex size-10 items-center justify-center rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={section.label}
            >
              <Icon className="size-4" />
              <span className={cn(
                "absolute -top-10 scale-0 rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-bold text-background transition-all group-hover:scale-100",
                "after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-foreground"
              )}>
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
