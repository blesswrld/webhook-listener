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

export async function updateWebhookName(formData: FormData) {
    const name = (formData.get("name") as string).trim();
    const id = formData.get("id") as string;

    if (!id) return { error: "Webhook ID is missing." };
    if (name.length > 0 && name.length < 2) {
        return { error: "Name must be at least 2 characters long." };
    }

    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const { error } = await supabase
        .from("webhooks")
        .update({ name: name || null }) // Если имя пустое, устанавливаем NULL
        .eq("id", id)
        .eq("user_id", user.id); // Дополнительная проверка на сервере

    if (error) {
        console.error("Error updating webhook name:", error);
        return { error: "Could not update webhook name." };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteWebhook(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) return { error: "Webhook ID is missing." };

    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Важнейшая проверка безопасности

    if (error) {
        console.error("Error deleting webhook:", error);
        return { error: "Could not delete webhook." };
    }

    revalidatePath("/dashboard");
    // После удаления перенаправляем на dashboard без query-параметров
    redirect("/dashboard");
}
