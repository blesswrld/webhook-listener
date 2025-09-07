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
export async function createWebhook(formData: FormData) {
    const webhookName = formData.get("name") as string;
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { error } = await supabase
        .from("webhooks")
        .insert({ user_id: user.id, name: webhookName || null }); // Передаем имя

    if (error) {
        console.error("Error creating webhook:", error);
        // В будущем можно возвращать ошибку
        return;
    }

    // Перезагружаем данные на странице dashboard, чтобы показать новый вебхук
    revalidatePath("/dashboard");
}

// Функция для получения запросов для конкретного вебхука
export async function getWebhookRequests(webhookId: string) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // RLS политика гарантирует, что мы получим запросы только для вебхука,
    // который принадлежит текущему пользователю.
    const { data, error } = await supabase
        .from("webhook_requests")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("received_at", { ascending: false }); // Новые вверху

    if (error) {
        console.error("Error fetching webhook requests:", error);
        return [];
    }

    return data;
}
