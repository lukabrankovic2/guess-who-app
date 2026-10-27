import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  // No password set: allow it locally, but block it if this is the live site
  if (!password) {
    return process.env.NODE_ENV === "production"
      ? new NextResponse("Site is not configured", { status: 503 })
      : NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6)); // "username:password"
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (given === password) return NextResponse.next();
  }

  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Heads up"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };