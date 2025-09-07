"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Функция для получения всех вебхуков текущего пользователя
export async function getWebhooks() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data, error } = await supabase
        .from("webhooks")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching webhooks:", error);
        return [];
    }

    return data;
}

// Server Action для создания нового вебхука
export async function createWebhook() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { error } = await supabase
        .from("webhooks")
        .insert({ user_id: user.id });

    if (error) {
        console.error("Error creating webhook:", error);
        // Можно добавить редирект с сообщением об ошибке
        return;
    }

    // Перезагружаем данные на странице dashboard, чтобы показать новый вебхук
    revalidatePath("/dashboard");
}
