import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWebhooks, getWebhookRequests } from "./actions";
import { CopyButton } from "@/app/components/ui/copy-button";
import { WebhookDetails } from "./webhook-details";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { CreateWebhookButton } from "./create-webhook-button";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { UserProfile } from "@/app/components/user-profile";
import { WebhookActions } from "./webhook-actions"; // Убедитесь, что импорт есть

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
                    <UserProfile />
                    {/* ThemeToggle вынесен и является соседним элементом */}
                    <ThemeToggle />
                </div>
            </header>

            <div className="grid md:grid-cols-[300px_1fr] flex-1 overflow-hidden">
                {/* Левая колонка: Список вебхуков */}
                <aside className="border-r bg-secondary/40 flex flex-col">
                    <div className="p-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Your Webhooks</h2>
                        {/* -- Заменяем форму на компонент -- */}
                        <CreateWebhookButton />
                    </div>
                    <ScrollArea className="flex-1">
                        <nav className="grid gap-2 p-4 pt-0">
                            {webhooks.map((hook) => (
                                // Теперь это div, а не Link
                                <div
                                    key={hook.id}
                                    className={cn(
                                        "flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all border",
                                        selectedWebhookId === hook.id
                                            ? "bg-accent/80 text-accent-foreground border-accent"
                                            : "hover:bg-accent/50 border-transparent"
                                    )}
                                >
                                    {/* Основная часть карточки теперь является ссылкой */}
                                    <Link
                                        href={`/dashboard?id=${hook.id}`}
                                        className="w-full"
                                    >
                                        <div className="font-semibold truncate pr-2">
                                            {hook.name || "Untitled Webhook"}
                                        </div>
                                        <div className="line-clamp-2 text-xs text-muted-foreground w-full break-all">
                                            {`${origin}/api/listen/${hook.id}`}
                                        </div>
                                    </Link>

                                    {/* Кнопки действий теперь СНАРУЖИ ссылки */}
                                    <div className="flex items-center justify-end w-full mt-2">
                                        <CopyButton
                                            textToCopy={`${origin}/api/listen/${hook.id}`}
                                        />
                                        <WebhookActions webhook={hook} />
                                    </div>
                                </div>
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
