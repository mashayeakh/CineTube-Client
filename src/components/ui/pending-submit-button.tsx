"use client";

import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PendingSubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    pendingText?: string;
};

export function PendingSubmitButton({
    children,
    className,
    pendingText = "Processing...",
    disabled,
    ...props
}: PendingSubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            {...props}
            disabled={pending || disabled}
            className={cn(
                "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70",
                className
            )}
        >
            {pending ? (
                <>
                    <Spinner className="size-3.5" />
                    <span>{pendingText}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}
