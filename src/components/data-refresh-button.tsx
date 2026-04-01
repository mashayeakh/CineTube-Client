"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DataRefreshButton() {
    const router = useRouter();
    const [isRefreshing, startTransition] = React.useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <Button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={isRefreshing ? "Refreshing data..." : "Refresh data"}
            aria-label={isRefreshing ? "Refreshing data" : "Refresh data"}
            variant="outline"
            size="icon"
            className="fixed right-4 bottom-4 z-50 rounded-full border-border/70 bg-background/90 shadow-lg backdrop-blur-sm sm:right-6 sm:bottom-6"
        >
            <RefreshCw className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
            <span className="sr-only">Refresh data</span>
        </Button>
    );
}
