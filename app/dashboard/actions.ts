"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Хелпер для очистки кастомного пути.
 * Извлекает последний сегмент из URL или slugify'ит обычную строку.
 * @param path - Ввод пользователя.
 * @returns Очищенный и безопасный для URL путь или null, если ввод пустой.
 */
function sanitizeCustomPath(path: string | null): string | null {
    if (!path || path.trim() === "") {
        return null;
    }

    let processedPath = path.trim();

    // Если пользователь вставил полный URL, извлекаем только путь
    if (
        processedPath.startsWith("http:") ||
        processedPath.startsWith("https:")
    ) {
        try {
            const url = new URL(processedPath);
            // Берем последний непустой сегмент пути
            const pathSegments = url.pathname.split("/").filter(Boolean);
            processedPath = pathSegments[pathSegments.length - 1] || "";
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Если URL невалидный, пробуем обработать как обычную строку
        }
    }

    // Преобразуем в "slug" формат: нижний регистр, замена пробелов на дефисы,
    // удаление недопустимых символов.
    return processedPath
        .toLowerCase()
        .replace(/\s+/g, "-") // заменяем пробелы на -
        .replace(/[^\w\-]+/g, "") // удаляем все не-буквы/цифры и не-дефисы
        .replace(/\-\-+/g, "-") // заменяем несколько -- на один -
        .replace(/^-+/, "") // убираем - в начале
        .replace(/-+$/, ""); // убираем - в конце
}

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
        .select("id, name, created_at, custom_path")
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
    const custom_path = sanitizeCustomPath(
        formData.get("custom_path") as string
    );
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

// Server Action для обновления вебхука (имя и кастомный путь)
export async function updateWebhook(formData: FormData) {
    const name = (formData.get("name") as string).trim();
    const custom_path = sanitizeCustomPath(
        formData.get("custom_path") as string
    );
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
        console.log(
            `Custom path changed from "${oldWebhook.custom_path}" to "${custom_path}". Deleting requests...`
        );
        const { error: deleteError } = await supabase
            .from("webhook_requests")
            .delete()
            .eq("webhook_id", id);
        if (deleteError) {
            console.error("Failed to delete old requests:", deleteError);
        }
    }

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
