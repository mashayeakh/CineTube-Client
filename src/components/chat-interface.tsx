/* eslint-disable react/jsx-key */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { sendChatMessage } from "@/service/bot.services";
import { cn } from "@/lib/utils";
import { Sparkles, Film, Star, Users, Zap, Shield, List, Code2, ChevronRight } from "lucide-react";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    suggestions?: string[];
}

// ── Hardcoded Q&A bank ──────────────────────────────────────────────────────
const HARDCODED_QA = [
    {
        keywords: ["what is cinetube", "what is this application", "what does cinetube do", "explain cinetube", "tell me about this platform"],
        question: "What is CineTube?",
        answer: "CineTube is a movie and series discovery platform built to help users find, save, and explore entertainment content. It lets people search titles, save favorites, manage watchlists, and discover recommendations from the CineTube library.",
    },
    {
        keywords: ["who created cinetube", "who built this project", "who is the developer", "who made this application"],
        question: "Who built this project?",
        answer: "CineTube was crafted by Md Masayeakh Islam, a talented full-stack developer with a passion for elegant, user-first entertainment experiences. He built this platform to make movie and series discovery seamless, stylish, and intuitive for every CineTube visitor.",
    },
    {
        keywords: ["is cinetube open source"],
        question: "Is CineTube open source?",
        answer: "CineTube is built as an open development project, and the backend code is available in the CineTube repository. This makes it easy for others to inspect and extend the platform.",
    },
    {
        keywords: ["why was cinetube built", "what is the goal of this platform", "what problem does cinetube solve", "why should i use cinetube"],
        question: "Why was CineTube built?",
        answer: "CineTube was built to help users discover, organize, and enjoy movies and series in one place. It solves the problem of scattered content by giving users a central platform to search, save, and recommend titles from its library.",
    },
    {
        keywords: ["what are the features of cinetube", "what can i do on this platform", "what does cinetube offer users", "is cinetube free to use", "what features are available"],
        question: "What features are available?",
        answer: "CineTube offers movie and series discovery, search, watchlist management, saving favorites, and premium features for subscribers. It is designed to be easy to use and provides a simple way to browse entertainment content.",
    },
    {
        keywords: ["what are the user roles", "what is a premium user", "what can admins do", "what can normal users do"],
        question: "What are the user roles?",
        answer: "CineTube supports different user roles: regular users can browse content, save movies, and manage watchlists. Premium users get additional subscription benefits, while admins can manage movies, series, and platform content.",
    },
    {
        keywords: ["what type of movies are available", "can i watch tv series here", "does cinetube support watchlists", "can i save movies"],
        question: "Can I save movies & build a watchlist?",
        answer: "CineTube provides a library of movies and series across genres. You can browse available titles, save movies, and build your own watchlist from the platform.",
    },
    {
        keywords: ["what is cinetube premium", "what are premium features", "do i need to pay for cinetube", "what happens if i subscribe"],
        question: "What is CineTube Premium?",
        answer: "CineTube Premium gives users extra platform benefits, such as enhanced access to content and a better browsing experience. Subscribing unlocks premium features while the core CineTube experience remains free.",
    },
    {
        keywords: ["what technologies are used", "is cinetube built with next.js", "what is the tech stack", "is this a full-stack application"],
        question: "What is the tech stack?",
        answer: "CineTube is a full-stack application. The backend uses Node.js, Express, Prisma, and PostgreSQL, while the frontend is built with Next.js and Tailwind CSS for a smooth, modern user experience.",
    },
    {
        keywords: ["what can admin do in cinetube", "how is content managed", "who manages movies and series"],
        question: "What can admins do?",
        answer: "Admins in CineTube can manage content, add or update movies and series, and keep the platform library organized. They are responsible for maintaining the CineTube collection and ensuring content is up to date.",
    },
    {
        keywords: ["how do i use cinetube", "how do i search for movies", "how do i save a movie", "how do i view my watchlist", "how do i rate a movie"],
        question: "How do I use CineTube?",
        answer: "Use CineTube by searching for movies or series, clicking the title you want, and saving it to your watchlist. You can rate titles, view saved items, and discover new content from the library.",
    },
];

// Pick N random unique items from the QA bank
function pickRandom<T>(arr: T[], n: number): T[] {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

// Pick follow-up suggestions — exclude questions already answered
function getFollowUpSuggestions(excludeQuestions: string[], count = 3): string[] {
    const remaining = HARDCODED_QA.filter(q => !excludeQuestions.includes(q.question));
    return pickRandom(remaining.length > 0 ? remaining : HARDCODED_QA, count).map(q => q.question);
}

// Initial 4 suggestions on welcome screen
const INITIAL_SUGGESTIONS = pickRandom(HARDCODED_QA, 4).map(q => q.question);

const SUGGESTION_ICONS = [
    <Film className="size-3.5" />,
    <Star className="size-3.5" />,
    <Users className="size-3.5" />,
    <Zap className="size-3.5" />,
    <Shield className="size-3.5" />,
    <List className="size-3.5" />,
    <Code2 className="size-3.5" />,
];

function getIcon(index: number) {
    return SUGGESTION_ICONS[index % SUGGESTION_ICONS.length];
}

export default function ChatInterface({ className }: { className?: string } = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            text: text.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Track which hardcoded question this matches
        const matchedQA = HARDCODED_QA.find(qa =>
            qa.question === text.trim() ||
            qa.keywords.some(kw => text.toLowerCase().includes(kw))
        );
        const newAnswered = matchedQA
            ? [...answeredQuestions, matchedQA.question]
            : answeredQuestions;
        setAnsweredQuestions(newAnswered);

        try {
            const response = await sendChatMessage(userMessage.text);
            const suggestions = getFollowUpSuggestions(newAnswered, 3);
            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                text: response.response,
                isUser: false,
                timestamp: new Date(),
                suggestions,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch {
            const suggestions = getFollowUpSuggestions(newAnswered, 3);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                text: "Sorry, I couldn't process your message. Please try again.",
                isUser: false,
                timestamp: new Date(),
                suggestions,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const showWelcome = messages.length === 0;

    return (
        <div className={cn("w-full h-full flex flex-col overflow-hidden rounded-b-3xl bg-white dark:bg-slate-950", className)}>

            {/* ── Messages ── */}
            <div
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-1 scroll-smooth"
            >
                {showWelcome ? (
                    /* ── Welcome Screen ── */
                    <div className="flex flex-col items-center justify-center min-h-full gap-5 px-1 py-4">
                        {/* Animated orb */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl animate-pulse" />
                            <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
                                <Sparkles className="size-8 text-white" />
                            </div>
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                                Hi, I am CineBot 👋
                            </h3>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">
                                Your AI guide for everything CineTube. Tap a question or ask your own.
                            </p>
                        </div>

                        {/* Suggested pills */}
                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-px flex-1 bg-slate-100 dark:bg-white/[0.06]" />
                                <span className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-600 uppercase">
                                    Try asking
                                </span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-white/[0.06]" />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {INITIAL_SUGGESTIONS.map((q, i) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        style={{ animationDelay: `${i * 60}ms` }}
                                        className="group flex items-center gap-2.5 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-left text-[13px] text-slate-700 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm hover:-translate-y-px dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300 animate-in fade-in slide-in-from-bottom-2"
                                    >
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400">
                                            {getIcon(i)}
                                        </span>
                                        <span className="flex-1 font-medium">{q}</span>
                                        <ChevronRight className="size-3.5 shrink-0 text-slate-300 group-hover:text-indigo-400 transition dark:text-slate-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Conversation ── */
                    <div className="space-y-3 pb-2">
                        {messages.map((message, msgIdx) => (
                            <div key={message.id} className="space-y-2">
                                {/* Bubble */}
                                <div className={cn(
                                    "flex items-end gap-2",
                                    message.isUser ? "justify-end" : "justify-start"
                                )}>
                                    {!message.isUser && (
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow shadow-indigo-500/25">
                                            <Sparkles className="size-3.5 text-white" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
                                        message.isUser
                                            ? "rounded-br-sm bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/20"
                                            : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-white/[0.07] dark:text-slate-200"
                                    )}>
                                        <p className="whitespace-pre-wrap">{message.text}</p>
                                        <p className={cn(
                                            "text-[10px] mt-1.5 opacity-50",
                                            message.isUser ? "text-right" : "text-left"
                                        )}>
                                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    {message.isUser && (
                                        <Avatar className="size-7 shrink-0">
                                            <AvatarFallback className="text-[10px] font-semibold bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                                You
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>

                                {/* Follow-up suggestions after bot reply — only on last bot message */}
                                {!message.isUser &&
                                    message.suggestions &&
                                    message.suggestions.length > 0 &&
                                    msgIdx === messages.length - 1 &&
                                    !isLoading && (
                                        <div className="pl-9 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2">
                                                You might also ask
                                            </p>
                                            {message.suggestions.map((s, i) => (
                                                <button
                                                    key={s}
                                                    onClick={() => sendMessage(s)}
                                                    style={{ animationDelay: `${i * 50}ms` }}
                                                    className="group flex items-center gap-2 w-full rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-left text-[12px] text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-px dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/[0.08] dark:hover:text-indigo-300 animate-in fade-in"
                                                >
                                                    <ChevronRight className="size-3 shrink-0 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                                                    <span className="font-medium">{s}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-start animate-in fade-in duration-200">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow shadow-indigo-500/25">
                                    <Sparkles className="size-3.5 text-white" />
                                </div>
                                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-white/[0.07]">
                                    <div className="flex gap-1 items-center h-4">
                                        <span className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0ms]" />
                                        <span className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:120ms]" />
                                        <span className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:240ms]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Input ── */}
            <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3 dark:border-white/[0.06] dark:bg-slate-950">
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                        className="flex-1 h-9 rounded-xl border-slate-200 bg-slate-50 text-[13px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 dark:border-white/10 dark:bg-white/[0.04]"
                    />
                    <Button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        size="sm"
                        className="h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-[13px] font-semibold hover:from-indigo-500 hover:to-violet-500 shadow shadow-indigo-500/25 disabled:opacity-40 transition-all"
                    >
                        {isLoading ? <Spinner className="size-4" /> : "Send"}
                    </Button>
                </div>
            </div>
        </div>
    );
}