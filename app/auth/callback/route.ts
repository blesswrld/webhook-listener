import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Всегда перенаправляем на /dashboard после успешного входа через провайдера
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    return NextResponse.redirect(
        `${origin}/login?message=Could not log in with provider`
    );
}
