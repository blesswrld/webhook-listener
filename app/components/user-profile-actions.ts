"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUsername(formData: FormData) {
    const username = formData.get("username") as string;
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.auth.updateUser({
        data: { user_name: username },
    });

    if (error) {
        console.error("Error updating username:", error);
        return { error: "Could not update username." };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function uploadAvatar(formData: FormData) {
    const avatarFile = formData.get("avatar") as File;
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Удаляем старый аватар, если он есть
    const { data: list, error: listError } = await supabase.storage
        .from("avatars")
        .list(user.id);

    // Добавляем обработку ошибки
    if (listError) {
        console.error("Error listing old avatars:", listError);
        // Не прерываем выполнение, так как это не критичная ошибка
    }

    if (list && list.length > 0) {
        const filesToRemove = list.map((file) => `${user.id}/${file.name}`);
        await supabase.storage.from("avatars").remove(filesToRemove);
    }

    const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

    if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        return { error: "Could not upload avatar." };
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
    });

    if (updateUserError) {
        console.error("Error updating user avatar URL:", updateUserError);
        return { error: "Could not update user profile." };
    }

    revalidatePath("/dashboard");
    return { success: true };
}
