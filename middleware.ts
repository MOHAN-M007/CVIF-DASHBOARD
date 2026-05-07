import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://cvif-backend.onrender.com").replace(/\/+$/, "");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // If no cookie at all, redirect quickly.
  const tokenCookie = req.cookies.get("token")?.value;
  if (!tokenCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  try {
    const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: { Cookie: `token=${tokenCookie}` },
      cache: "no-store",
    });
    if (!meRes.ok) throw new Error("unauthorized");
    const data = await meRes.json();
    const role = data?.user?.role;
    if (role !== "owner") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};

