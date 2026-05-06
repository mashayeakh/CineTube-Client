import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-slate-100 bg-white/50 p-8 text-center backdrop-blur-sm",
        className
      )}
    >
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-rose-100 bg-rose-50/50 p-8 text-center backdrop-blur-sm",
        className
      )}
    >
      <div className="rounded-full bg-rose-100 p-3 text-rose-600">
        <AlertCircle className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">Something went wrong</h3>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 border-rose-200 text-rose-700 hover:bg-rose-100"
        >
          <RefreshCcw className="mr-2 size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
