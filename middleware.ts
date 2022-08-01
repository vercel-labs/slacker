import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin"],
};

export default function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin") {
    const basicAuth = req.headers.get("authorization");
    const url = req.nextUrl;

    if (basicAuth) {
      const auth = basicAuth.split(" ")[1];
      const [user, pwd] = atob(auth).split(":");

      if (
        user === process.env.ADMIN_USERNAME &&
        pwd === process.env.ADMIN_PASSWORD
      ) {
        return NextResponse.next();
      }
    }
    url.pathname = "/api/admin";

    return NextResponse.rewrite(url);
  }
}
