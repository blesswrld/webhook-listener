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
        .select("id, name, created_at, custom_path") // <-- Добавляем custom_path
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
    const name = (formData.get("name") as string).trim();
    const custom_path = (formData.get("custom_path") as string).trim() || null;
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const { error } = await supabase
        .from("webhooks")
        .insert({ user_id: user.id, name: name || null, custom_path });

    if (error) {
        console.error("Error creating webhook:", error);
        if (error.code === "23505") {
            // Код ошибки PostgreSQL для unique violation
            return { error: "This custom path is already taken." };
        }
        return { error: "Could not create webhook." };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateWebhook(formData: FormData) {
    const name = (formData.get("name") as string).trim();
    const custom_path = (formData.get("custom_path") as string).trim() || null;
    const id = formData.get("id") as string;

    if (!id) return { error: "Webhook ID is missing." };

    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Получаем старый вебхук, чтобы проверить, изменился ли custom_path
    const { data: oldWebhook, error: fetchError } = await supabase
        .from("webhooks")
        .select("custom_path")
        .eq("id", id)
        .eq("user_id", user.id) // Убеждаемся, что получаем свой вебхук
        .single();

    if (fetchError) {
        return { error: "Could not find webhook to update." };
    }

    // Если custom_path был изменен, удаляем всю историю запросов для этого вебхука
    if (oldWebhook.custom_path !== custom_path) {
        await supabase.from("webhook_requests").delete().eq("webhook_id", id);
    }

    // Обновляем вебхук
    const { error } = await supabase
        .from("webhooks")
        .update({ name: name || null, custom_path })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating webhook:", error);
        if (error.code === "23505") {
            return { error: "This custom path is already taken." };
        }
        return { error: "Could not update webhook." };
    }

    revalidatePath("/dashboard");
    return { success: true };
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

// Функция для обновления запросов для конкретного вебхука
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

// Функция для удаления запросов для конкретного вебхука
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
