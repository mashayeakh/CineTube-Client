export default function ChatPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white/90 px-8 py-10 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-white text-center">AI Chat Assistant</h1>
                <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    The chat feature is now available as a sticky widget in the bottom-right corner of the screen.
                </p>
            </div>
        </div>
    );
}
