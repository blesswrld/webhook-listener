import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { signOut } from "@/app/login/actions";
import { createWebhook, getWebhooks, getWebhookRequests } from "./actions";
import { CopyButton } from "@/app/components/ui/copy-button";
import { WebhookDetails } from "./webhook-details";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { id?: string };
}) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Если пользователя нет, перенаправляем на страницу входа
    if (!user) {
        return redirect("/login");
    }

    const selectedWebhookId = searchParams.id;
    const [webhooks, initialRequests] = await Promise.all([
        getWebhooks(),
        selectedWebhookId
            ? getWebhookRequests(selectedWebhookId)
            : Promise.resolve([]),
    ]);

    const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    return (
        <div className="h-screen w-full flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shrink-0">
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

            <div className="grid md:grid-cols-[300px_1fr] flex-1 overflow-hidden">
                {/* Левая колонка: Список вебхуков */}
                <aside className="border-r bg-secondary/40 flex flex-col">
                    <div className="p-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Your Webhooks</h2>
                        <form>
                            <Button formAction={createWebhook} size="sm">
                                Create New
                            </Button>
                        </form>
                    </div>
                    <ScrollArea className="flex-1">
                        <nav className="grid gap-2 p-4 pt-0">
                            {webhooks.map((hook) => (
                                <Link
                                    key={hook.id}
                                    href={`/dashboard?id=${hook.id}`}
                                    className={cn(
                                        "flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent/50",
                                        selectedWebhookId === hook.id &&
                                            "bg-accent/80 text-accent-foreground"
                                    )}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className="font-semibold">
                                            Endpoint
                                        </div>
                                        <CopyButton
                                            textToCopy={`${origin}/api/listen/${hook.id}`}
                                        />
                                    </div>
                                    <div className="line-clamp-2 text-xs text-muted-foreground w-full break-all">
                                        {`${origin}/api/listen/${hook.id}`}
                                    </div>
                                </Link>
                            ))}
                        </nav>
                    </ScrollArea>
                </aside>

                {/* Правая колонка: Детали и запросы */}
                <main className="p-4 md:p-6 h-full overflow-hidden">
                    {selectedWebhookId ? (
                        <WebhookDetails
                            key={selectedWebhookId} // Ключ для сброса состояния при смене вебхука
                            initialRequests={initialRequests}
                            webhookId={selectedWebhookId}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-center p-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Select a Webhook
                                </h3>
                                <p className="text-muted-foreground">
                                    Choose a webhook from the list on the left
                                    to view its requests.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
