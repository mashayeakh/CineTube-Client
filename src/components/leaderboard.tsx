"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardItem {
  name: string;
  username?: string;
  avatar?: string;
  value: number;
  maxValue?: number;
  rank?: number;
}

interface LeaderboardProps {
  title?: string;
  description?: string;
  items?: LeaderboardItem[];
  valuePrefix?: string;
  valueSuffix?: string;
  showRankIcons?: boolean;
  className?: string;
}

const defaultItems: LeaderboardItem[] = [
  {
    name: "Alex Morgan",
    username: "@alexm",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1760&auto=format&fit=crop",
    value: 4520
  },
  {
    name: "Sarah Chen",
    username: "@sarahc",
    avatar: "https://images.unsplash.com/photo-1494790108777-385d4003c8b1?q=80&w=1887&auto=format&fit=crop",
    value: 3210
  },
  {
    name: "Marcus Wright",
    username: "@marcusw",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop",
    value: 2890
  },
  {
    name: "Emily Rodriguez",
    username: "@emilyr",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
    value: 1890
  },
  {
    name: "David Kim",
    username: "@davidk",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
    value: 1240
  },
  {
    name: "Lisa Thompson",
    username: "@lisat",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
    value: 980
  },
  {
    name: "James Wilson",
    username: "@jamesw",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
    value: 750
  },
];

const Leaderboard = ({
  title = "Top Contributors",
  description = "Leaderboard rankings",
  items = defaultItems,
  valuePrefix = "",
  valueSuffix = "",
  showRankIcons = true,
  className,
}: LeaderboardProps) => {
  const maxValue = items[0]?.value || 1;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="size-5 text-yellow-500" />;
      case 1:
        return <Medal className="size-5 text-gray-400" />;
      case 2:
        return <Medal className="size-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground w-5 text-center">#{index + 1}</span>;
    }
  };

  return (
    <section className={cn("w-full px-8", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {showRankIcons && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
              <Trophy className="size-4 text-yellow-500" />
              <span className="text-sm font-medium">Top 7</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item, index) => (
          <div key={index} className="space-y-2 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Rank Indicator */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={item.avatar} alt={item.name} />
                    <AvatarFallback className="bg-primary/10">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">
                          #1
                        </span>
                      )}
                    </div>
                    {item.username && (
                      <p className="text-xs text-muted-foreground">{item.username}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="text-right">
                <span className="font-bold text-lg">
                  {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                </span>
                {index === 0 && (
                  <p className="text-xs text-green-500">+12% vs last week</p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative pl-11">
              <Progress
                value={(item.value / maxValue) * 100}
                className={cn(
                  "h-2.5 transition-all",
                  index === 0 ? "bg-primary/20" : "bg-muted"
                )}
              />
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 text-center border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Updated daily • Based on contributions
          </p>
        </div>
      </CardContent>
    </section>
  );
};

export { Leaderboard };