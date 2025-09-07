import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Создаем "сервисный" клиент Supabase, который может обходить RLS.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Эта функция будет обрабатывать ВСЕ методы (GET, POST, PUT, DELETE, и т.д.)
export async function handler(
    req: NextRequest,
    { params }: { params: { webhookId: string } }
) {
    const { webhookId } = params;

    // 1. Проверяем, существует ли такой вебхук
    const { data: webhook, error: webhookError } = await supabaseAdmin
        .from("webhooks")
        .select("id")
        .eq("id", webhookId)
        .single();

    if (webhookError || !webhook) {
        // Если вебхук не найден, возвращаем 404
        return new NextResponse("Webhook not found", { status: 404 });
    }

    // 2. Собираем информацию о запросе
    const method = req.method;
    const headers = Object.fromEntries(req.headers.entries());
    const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    let body: string;
    try {
        body = await req.text(); // Читаем тело как сырой текст
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        body = "[Could not read body]";
    }

    // 3. Сохраняем запрос в базу данных
    const { error: insertError } = await supabaseAdmin
        .from("webhook_requests")
        .insert({
            webhook_id: webhookId,
            method,
            headers,
            body,
            query_params: queryParams,
        });

    if (insertError) {
        console.error("Error inserting webhook request:", insertError);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    // 4. Возвращаем успешный ответ
    // 200 OK — это стандартный ответ для успешно принятых вебхуков
    return new NextResponse("Webhook request received successfully", {
        status: 200,
    });
}

// Экспортируем handler для всех HTTP-методов
export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
};
