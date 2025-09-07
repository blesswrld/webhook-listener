"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { type getWebhookRequests } from "./actions";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Определяем тип для одного запроса
type WebhookRequest = Awaited<ReturnType<typeof getWebhookRequests>>[0];

interface WebhookDetailsProps {
    initialRequests: WebhookRequest[];
    webhookId: string;
}

// Хелпер для безопасного парсинга JSON
function safeJsonParse(str: string) {
    try {
        return { ok: true, value: JSON.parse(str) };
    } catch {
        return { ok: false, value: str };
    }
}

export function WebhookDetails({
    initialRequests,
    webhookId,
}: WebhookDetailsProps) {
    const [requests, setRequests] = useState(initialRequests);
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Функция для "мягкого" обновления данных без полной перезагрузки страницы
        const refreshData = () => {
            // router.refresh() перезапрашивает данные для текущего маршрута на сервере
            router.refresh();
        };

        // Очищаем предыдущий интервал, если он был
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Запускаем новый интервал, который будет обновлять данные каждые 3 секунды
        intervalRef.current = setInterval(refreshData, 3000);

        // Очищаем интервал при размонтировании компонента
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [router, webhookId]); // Перезапускаем интервал, если пользователь выбрал другой вебхук

    // Этот useEffect синхронизирует состояние с новыми данными,
    // которые приходят после router.refresh()
    useEffect(() => {
        setRequests(initialRequests);
    }, [initialRequests]);

    if (requests.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <div>
                    <h3 className="text-xl font-semibold mb-2">
                        Waiting for requests...
                    </h3>
                    <p className="text-muted-foreground">
                        Send an HTTP request to your webhook URL. New requests
                        will appear automatically.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <Accordion type="single" collapsible className="w-full">
                {requests.map((req) => {
                    const parsed = safeJsonParse(req.body || "{}");

                    return (
                        <AccordionItem key={req.id} value={req.id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-sm px-2 py-1 bg-accent/20 text-accent-foreground rounded-md">
                                        {req.method}
                                    </span>
                                    <span className="text-sm font-mono text-muted-foreground">
                                        Received at{" "}
                                        {new Date(
                                            req.received_at
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-secondary/30 rounded-b-md">
                                <div className="grid gap-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Body
                                        </h4>
                                        {parsed.ok ? (
                                            <SyntaxHighlighter
                                                language="json"
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    borderRadius: "0.375rem",
                                                    margin: 0,
                                                }}
                                            >
                                                {JSON.stringify(
                                                    parsed.value,
                                                    null,
                                                    2
                                                )}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="text-red-500 font-medium text-sm">
                                                    Invalid JSON
                                                </div>
                                                <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">
                                                    {parsed.value}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Headers
                                        </h4>
                                        <pre className="p-3 bg-background rounded-md overflow-x-auto">
                                            <code>
                                                {JSON.stringify(
                                                    req.headers,
                                                    null,
                                                    2
                                                )}
                                            </code>
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Query Params
                                        </h4>
                                        <pre className="p-3 bg-background rounded-md overflow-x-auto">
                                            <code>
                                                {JSON.stringify(
                                                    req.query_params,
                                                    null,
                                                    2
                                                )}
                                            </code>
                                        </pre>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </ScrollArea>
    );
}
