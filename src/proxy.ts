import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if session token exists in cookies (lightweight check for Edge runtime)
    const sessionToken = request.cookies.get("better-auth.session_token");

    // Define public routes that don't require authentication
    const isPublicRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/";

    // If user is not authenticated and trying to access a protected route
    if (!sessionToken && !isPublicRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        console.log("User is not authenticated, redirecting to login page");
        console.log("Session Token: ", sessionToken);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth pages, redirect to entries
    if (
        sessionToken &&
        (pathname.startsWith("/login") || pathname.startsWith("/signup"))
    ) {
        return NextResponse.redirect(new URL("/entries", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
