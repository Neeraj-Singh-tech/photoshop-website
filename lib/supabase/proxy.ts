import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest
) {
  // Only attempt to use Supabase server client when explicitly enabled.
  const useSupabase =
    process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

  if (!useSupabase) {
    return NextResponse.next({ request });
  }

  // Lazy-import to avoid module resolution/runtime errors when not using Supabase.
  const { createServerClient } = await import("@supabase/ssr");

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}