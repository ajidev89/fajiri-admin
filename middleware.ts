import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptData } from "./lib/crypto";

export function middleware(request: NextRequest) {
    const encryptedToken = request.cookies.get("fajiri_token");
    const token = encryptedToken ? decryptData(encryptedToken.value) : null;
    const { pathname } = request.nextUrl;

    // 1. If user is authenticated and tries to access login/verify-otp, redirect to dashboard
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/verify-otp"))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is NOT authenticated and tries to access dashboard, redirect to login
    if (!token && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/dashboard/:path*", "/login", "/verify-otp"],
};
