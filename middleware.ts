import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Ограничение доступа к панели управления штаб-квартиры
    if (path.startsWith("/admin") && token?.role !== "HQ_ADMIN") {
      return NextResponse.redirect(new URL("/store/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/store/:path*"],
};