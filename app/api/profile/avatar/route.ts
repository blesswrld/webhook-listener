import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File;
    if (!avatarFile || avatarFile.size === 0) {
        return NextResponse.json(
            { error: "Please select a file" },
            { status: 400 }
        );
    }

    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Удаляем старый аватар, если он есть
    const { data: list } = await supabase.storage.from("avatars").list(user.id);
    if (list && list.length > 0) {
        const filesToRemove = list.map((file) => `${user.id}/${file.name}`);
        await supabase.storage.from("avatars").remove(filesToRemove);
    }

    // Загружаем новый аватар
    const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);
    if (uploadError) {
        return NextResponse.json(
            { error: "Failed to upload avatar" },
            { status: 500 }
        );
    }

    // Обновляем URL в профиле пользователя
    const {
        data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
    });
    if (updateUserError) {
        return NextResponse.json(
            { error: "Failed to update user profile" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
