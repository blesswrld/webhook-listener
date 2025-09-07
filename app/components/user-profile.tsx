import { createClient } from "@/lib/supabase/server";
import { UserProfileClient } from "./user-profile-client"; // Импортируем наш клиентский компонент

export async function UserProfile() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Готовим данные для передачи в клиентский компонент
    const userProfileData = {
        isGithubUser: user.app_metadata.provider === "github",
        avatarUrl: user.user_metadata?.avatar_url,
        userName:
            user.user_metadata?.user_name || user.user_metadata?.full_name,
        userEmail: user.email,
        fallbackText: (
            user.user_metadata?.user_name ||
            user.user_metadata?.full_name ||
            user.email ||
            "U"
        )
            .substring(0, 2)
            .toUpperCase(),
    };

    return <UserProfileClient userProfileData={userProfileData} />;
}
