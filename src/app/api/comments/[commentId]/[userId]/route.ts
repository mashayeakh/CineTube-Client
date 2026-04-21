import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api/v1";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ commentId: string; userId: string }> }
) {
    const { commentId, userId } = await params; 
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND_URL}/comments/${commentId}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: req.headers.get("cookie") || "" },
        body: JSON.stringify(body),
        credentials: "include",
    });
    const data = await backendRes.json().catch(() => ({}));
    return new NextResponse(JSON.stringify(data), { status: backendRes.status });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ commentId: string; userId: string }> }
) {
    const { commentId, userId } = await params; 
    const backendRes = await fetch(`${BACKEND_URL}/comments/${commentId}/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", cookie: req.headers.get("cookie") || "" },
        credentials: "include",
    });
    const data = await backendRes.json().catch(() => ({}));
    return new NextResponse(JSON.stringify(data), { status: backendRes.status });
}