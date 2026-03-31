import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Eğer "/admin" ve alt yollara erişilmek isteniyorsa admin token'ını doğrula
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const adminToken = request.cookies.get('admin_token');
        if (!adminToken || adminToken.value !== 'admin-session-token') {
             return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    // Eğer "/admin/login" gidiyorsa ve zaten oturum açıksa dashboard'a yönlendir
    if (pathname === "/admin/login") {
        const adminToken = request.cookies.get('admin_token');
        if (adminToken && adminToken.value === 'admin-session-token') {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return await auth0.middleware(request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ]
}
