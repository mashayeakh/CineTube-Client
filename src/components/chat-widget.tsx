"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import ChatInterface from "@/components/chat-interface";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {isOpen ? (
                <div className="w-[380px] max-w-full rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center justify-between rounded-t-3xl bg-slate-100 px-4 py-3 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                        <div>
                            <p className="text-sm font-semibold">AI Chat Assistant</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ask anything about CineTube</p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <div className="h-[620px] w-full">
                        <ChatInterface className="h-full" />
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Open chat"
                >
                    <MessageSquare className="size-6" />
                </button>
            )}
        </div>
    );
}
