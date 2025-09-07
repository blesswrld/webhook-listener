import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

// Это Server Component, поэтому он может быть асинхронным
export default async function Home() {
    // Создаем серверный клиент Supabase для безопасного доступа к данным
    const supabase = createClient();
    // Проверяем, аутентифицирован ли пользователь, делая запрос к серверу Supabase
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
            <h1 className="text-4xl font-bold mb-8">
                Welcome to Webhook Listener!
            </h1>
            <div className="flex gap-4 items-center">
                {/* Условный рендеринг: показываем разный контент в зависимости от статуса пользователя */}
                {user ? (
                    // Если пользователь вошел в систему
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Logged in as {user.email}
                        </p>
                        <Button asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </div>
                ) : (
                    // Если пользователь не вошел в систему
                    <Button asChild>
                        <Link href="/login">Login to Get Started</Link>
                    </Button>
                )}
            </div>
        </main>
    );
}
