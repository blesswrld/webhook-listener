import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWebhooks, getWebhookRequests } from "./actions";
import { WebhookDetails } from "./webhook-details";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { CreateWebhookButton } from "./create-webhook-button";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { UserProfile } from "@/app/components/user-profile";
import { WebhookCard } from "./webhook-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <div className="flex h-screen w-full flex-col">
            {/* Хедер */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <UserProfile />
                    {/* ThemeToggle вынесен и является соседним элементом */}
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* --- САЙДБАР (адаптивный) --- */}
                <aside className="hidden md:flex min-w-[250px] max-w-sm flex-1 flex-col border-r bg-muted/40">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h2 className="text-base font-semibold">
                            Your Webhooks
                        </h2>
                        <CreateWebhookButton />
                    </div>
                    <ScrollArea className="flex-1">
                        <nav className="grid gap-2 p-4 pt-2">
                            {webhooks.map((hook) => (
                                <WebhookCard
                                    key={hook.id}
                                    hook={hook}
                                    isSelected={selectedWebhookId === hook.id}
                                    origin={origin}
                                />
                            ))}
                        </nav>
                    </ScrollArea>
                </aside>

                {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
                <main className="flex-[2] overflow-y-auto bg-background">
                    {selectedWebhookId ? (
                        // Когда выбран вебхук
                        <div className="p-4 md:p-6 h-full">
                            {/* Кнопка "Назад" (только мобилки) */}
                            <Link
                                href="/dashboard"
                                className="md:hidden mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to list
                            </Link>
                            <WebhookDetails
                                key={selectedWebhookId}
                                initialRequests={initialRequests}
                                webhookId={selectedWebhookId}
                            />
                        </div>
                    ) : (
                        // Когда вебхук не выбран
                        <>
                            {/* Список для мобилок */}
                            <div className="md:hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b">
                                    <h2 className="text-base font-semibold">
                                        Your Webhooks
                                    </h2>
                                    <CreateWebhookButton />
                                </div>
                                <nav className="grid gap-2 p-4 pt-2">
                                    {webhooks.map((hook) => (
                                        <WebhookCard
                                            key={hook.id}
                                            hook={hook}
                                            isSelected={false}
                                            origin={origin}
                                        />
                                    ))}
                                </nav>
                            </div>
                            {/* Заглушка для десктопов */}
                            <div className="hidden h-full items-center justify-center text-center p-8 md:flex">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        Select a Webhook
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Choose a webhook from the list on the
                                        left to view its requests.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
