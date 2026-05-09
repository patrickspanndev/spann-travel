import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";

const PROTECTED_PRE = [
  "/dashboard",
  "/checklists",
  "/loyalty-programs",
  "/trips",
  "/travel-ideas",
  "/strategy",
  "/settings",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PRE.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const publicCfg = getPublicSupabaseConfig();
  if (!publicCfg) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    publicCfg.url,
    publicCfg.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !user) {
    const url = new URL("/login", request.url);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value);
    });
    return redirectResponse;
  }

  if (pathname === "/login" && user) {
    const url = new URL("/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
