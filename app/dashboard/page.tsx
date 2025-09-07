import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { signOut } from "@/app/login/actions";

export default async function DashboardPage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Если пользователя нет, перенаправляем на страницу входа
    if (!user) {
        return redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-bold">
                    Welcome to your Dashboard
                </h1>
                <p className="text-muted-foreground">
                    You are logged in as:{" "}
                    <span className="font-mono text-foreground">
                        {user.email}
                    </span>
                </p>

                {/* Кнопка выхода */}
                <form>
                    <Button formAction={signOut} variant="secondary">
                        Sign Out
                    </Button>
                </form>
            </div>
        </div>
    );
}
