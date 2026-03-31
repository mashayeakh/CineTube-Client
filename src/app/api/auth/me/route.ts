import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/auth/user/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                return NextResponse.json(
                    { error: "Not authenticated" },
                    { status: res.status }
                );
            }

            console.error("Backend error:", res.status);
            return NextResponse.json(
                { error: "Failed to fetch user" },
                { status: res.status }
            );
        }

        const response = await res.json();
        const { result } = response;

        if (!result) {
            return NextResponse.json(
                { error: "No user data in response" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            name: result.name,
            email: result.email,
            image: result.image,
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json(
            { error: "Failed to fetch user info" },
            { status: 500 }
        );
    }
}
