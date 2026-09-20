import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptData } from "./lib/crypto";

const PUBLIC_PREFIXES = ["/login", "/verify-otp", "/forget-password", "/change-password"];

function isPublicPath(pathname: string) {
    return PUBLIC_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
    const encryptedToken = request.cookies.get("fajiri_token");
    const token = encryptedToken ? decryptData(encryptedToken.value) : null;
    const { pathname } = request.nextUrl;

    if (token && isPublicPath(pathname) && !pathname.startsWith("/change-password")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!token && !isPublicPath(pathname)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
