function resolveBotApiBaseUrls() {
    const envBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL;

    const candidates = [
        envBase,
        "http://localhost:5000/api/v1",
        "http://localhost:5000",
    ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/\/$/, ""));

    return Array.from(new Set(candidates));
}

export interface ChatMessage {
    id: string;
    role?: string;
    message?: string;
    response?: string;
    result?: string;
    timestamp?: string;
    createdAt?: string;
}

function normalizeBotText(value: unknown): string {
    if (typeof value === "string") {
        return value.trim();
    }
    if (typeof value === "object" && value !== null) {
        const record = value as Record<string, unknown>;
        // drill one more level if result is itself an object
        const inner = record.result ?? record.response ?? record.message;
        if (typeof inner === "string") return inner.trim();
        if (typeof inner === "object" && inner !== null) {
            const deep = (inner as Record<string, unknown>);
            return String(deep.result ?? deep.response ?? deep.message ?? "").trim();
        }
        return String(inner ?? "").trim();
    }
    return String(value ?? "").trim();
}

export async function sendChatMessage(message: string): Promise<{ response: string }> {
    const bases = resolveBotApiBaseUrls();
    // put your actual working path first
    const paths = [
        "/bot-message/chat",
        "/api/v1/bot-message/chat",
        "/bot/message",
        "/api/v1/bot/message",
    ];

    for (const base of bases) {
        for (const path of paths) {
            const url = `${base}${path}`;

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ message }),
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Bot raw response from", url, data);

                    // Your backend shape: { success, result: { result: "AI text..." } }
                    const raw =
                        data?.result?.result ??
                        data?.result?.response ??
                        data?.result?.message ??
                        data?.response ??
                        data?.message ??
                        data?.result ??
                        data;

                    const botResponse =
                        typeof raw === "string"
                            ? raw.trim()
                            : normalizeBotText(raw);

                    if (botResponse) {
                        return { response: botResponse };
                    }
                }
            } catch (err) {
                console.warn("⚠️ Failed attempt:", url, err);
                continue;
            }
        }
    }

    throw new Error(
        "Failed to send message: All configured endpoints failed. Check your backend is running."
    );
}

export async function getChatHistory(): Promise<ChatMessage[]> {
    const bases = resolveBotApiBaseUrls();
    const paths = [
        "/bot-message/history",
        "/api/v1/bot-message/history",
        "/bot/history",
        "/api/v1/bot/history",
    ];

    for (const base of bases) {
        for (const path of paths) {
            const url = `${base}${path}`;

            try {
                const res = await fetch(url, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Chat history raw response:", data);

                    let historyData: unknown = data.data ?? data.result ?? data;
                    if (
                        historyData &&
                        typeof historyData === "object" &&
                        !Array.isArray(historyData) &&
                        "result" in historyData
                    ) {
                        historyData = (historyData as { result?: unknown }).result;
                    }

                    if (!Array.isArray(historyData)) {
                        console.warn("History data is not an array:", historyData);
                        return [];
                    }

                    return historyData.map((item) => {
                        const record = item as Record<string, unknown>;
                        const responseText = normalizeBotText(
                            record.result ?? record.response ?? record.message
                        );
                        return {
                            id: String(record._id ?? record.id ?? Date.now()),
                            role: String(record.role ?? "USER"),
                            message: String(record.message ?? ""),
                            response: responseText,
                            timestamp: String(
                                record.timestamp ?? record.createdAt ?? new Date().toISOString()
                            ),
                            createdAt: String(
                                record.createdAt ?? record.timestamp ?? new Date().toISOString()
                            ),
                        };
                    });
                }
            } catch (error) {
                console.warn("⚠️ Error fetching history from", url, error);
                continue;
            }
        }
    }

    // return empty instead of throwing — history is optional
    console.warn("Could not load chat history from any endpoint.");
    return [];
}