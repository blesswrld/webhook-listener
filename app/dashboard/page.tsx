import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { signOut } from "@/app/login/actions";
import { createWebhook, getWebhooks } from "./actions"; // Импортируем наши функции
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { CopyButton } from "@/app/components/ui/copy-button"; // Импортируем кнопку

export default async function DashboardPage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Если пользователя нет, перенаправляем на страницу входа
    if (!user) {
        return redirect("/login");
    }

    const webhooks = await getWebhooks();
    const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    return (
        <div className="w-full min-h-screen bg-secondary/40">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground hidden md:block">
                        {user.email}
                    </p>
                    <form>
                        {/* Кнопка выхода */}
                        <Button
                            formAction={signOut}
                            variant="outline"
                            size="sm"
                        >
                            Sign Out
                        </Button>
                    </form>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Webhooks</h2>
                    <form>
                        <Button formAction={createWebhook}>
                            Create New Webhook
                        </Button>
                    </form>
                </div>

                {webhooks && webhooks.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {webhooks.map((webhook) => (
                            <Card key={webhook.id}>
                                <CardHeader>
                                    <CardTitle>Webhook Endpoint</CardTitle>
                                    <CardDescription>
                                        Created at:{" "}
                                        {new Date(
                                            webhook.created_at
                                        ).toLocaleString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-secondary">
                                        <code className="text-sm truncate">
                                            {`${origin}/api/listen/${webhook.id}`}
                                        </code>
                                        <CopyButton
                                            textToCopy={`${origin}/api/listen/${webhook.id}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">
                            No webhooks yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Click the button above to create your first webhook
                            endpoint.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
