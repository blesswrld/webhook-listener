import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Обработчик POST-запросов
export async function POST(request: Request) {
    // Извлекаем данные из формы
    const formData = await request.formData();
    const username = (formData.get("username") as string)?.trim();

    // Серверная валидация данных
    if (!username || username.length < 2) {
        return NextResponse.json(
            { error: "Username must be at least 2 characters" },
            { status: 400 }
        );
    }

    // Создаем серверный клиент Supabase
    const supabase = createClient();
    // Получаем текущего пользователя для проверки аутентификации
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Обновляем метаданные пользователя в Supabase Auth
    const { error } = await supabase.auth.updateUser({
        data: { user_name: username },
    });
    if (error) {
        return NextResponse.json(
            { error: "Failed to update username" },
            { status: 500 }
        );
    }

    // Возвращаем успешный ответ
    return NextResponse.json({ success: true });
}
