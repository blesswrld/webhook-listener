"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signIn(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect("/login?message=Could not authenticate user");
    }

    revalidatePath("/", "layout");
    return redirect("/dashboard");
}

export async function signUp(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // Можно добавить email_redirect_to для подтверждения email
            // emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect("/login?message=Could not create user");
    }

    // Supabase отправит письмо для подтверждения email.
    // Можно показать сообщение об этом.
    return redirect("/login?message=Check email to continue sign in process");
}

export async function signInWithGithub() {
    const origin = headers().get("origin");
    const supabase = createClient();

    // Здесь мы просто инициируем OAuth-процесс. Основная логика будет в callback.
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error("GitHub Sign-In Error:", error);
        return redirect("/login?message=Could not authenticate with GitHub");
    }
    return redirect(data.url);
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();

    revalidatePath("/", "layout");
    return redirect("/");
}
