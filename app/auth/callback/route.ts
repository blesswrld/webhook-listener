import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options });
                    },
                },
            }
        );

        // Обмениваем код на сессию. ЭТО НЕ СОЗДАЕТ ПОЛЬЗОВАТЕЛЯ, А ТОЛЬКО ДАЕТ НАМ ДАННЫЕ
        const {
            data: { session },
        } = await supabase.auth.exchangeCodeForSession(code);

        if (session) {
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    // Если что-то пошло не так
    return NextResponse.redirect(
        `${origin}/login?message=Could not log in with provider`
    );
}
