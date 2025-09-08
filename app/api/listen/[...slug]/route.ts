import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Создаем "сервисный" клиент Supabase, который может обходить RLS
// для записи входящих запросов.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Универсальный обработчик для всех HTTP-методов
async function handler(
    req: NextRequest,
    { params }: { params: { slug: string[] } }
) {
    // Собираем полный путь из массива slug. Например, /api/listen/my/custom/path
    const path = params.slug[0];

    // Ищем вебхук в базе данных. Запрос пытается найти совпадение
    // либо в колонке 'id' (для стандартных UUID), либо в 'custom_path'.
    const { data: webhook, error: webhookError } = await supabaseAdmin
        .from("webhooks")
        .select("id")
        .or(`id.eq.${path},custom_path.eq.${path}`) // Ключевая логика поиска
        .single();

    if (webhookError || !webhook) {
        // Если вебхук не найден ни по одному из полей, возвращаем 404.
        return new NextResponse("Webhook not found", { status: 404 });
    }

    // Собираем информацию о входящем запросе
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

    // Сохраняем собранные данные в таблицу webhook_requests
    const { error: insertError } = await supabaseAdmin
        .from("webhook_requests")
        .insert({
            webhook_id: webhook.id, // Важно: всегда используем найденный ID вебхука
            method,
            headers,
            body,
            query_params: queryParams,
        });

    if (insertError) {
        console.error("Error inserting webhook request:", insertError);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Возвращаем успешный ответ
    return new NextResponse("Webhook request received successfully", {
        status: 200,
    });
}

// Экспортируем ту же самую функцию handler под именами всех нужных HTTP-методов.
export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
    handler as HEAD,
    handler as OPTIONS,
};
