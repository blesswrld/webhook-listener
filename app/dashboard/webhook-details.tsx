"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
// -- Импортируем тип Realtime-события --
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Определяем тип для одного запроса
type WebhookRequest = Awaited<ReturnType<typeof getWebhookRequests>>[0];

interface WebhookDetailsProps {
    initialRequests: WebhookRequest[];
    webhookId: string;
}

export function WebhookDetails({
    initialRequests,
    webhookId,
}: WebhookDetailsProps) {
    const [requests, setRequests] = useState(initialRequests);
    const supabase = createClient();

    useEffect(() => {
        // -- Типизируем payload --
        const handleNewRequest = (
            payload: RealtimePostgresChangesPayload<WebhookRequest>
        ) => {
            // Убеждаемся, что событие - это INSERT и есть новые данные
            if (payload.eventType === "INSERT" && payload.new) {
                // `payload.new` теперь будет иметь тип WebhookRequest
                setRequests((currentRequests) => [
                    payload.new,
                    ...currentRequests,
                ]);
            }
        };

        const channel = supabase
            .channel(`realtime-requests:${webhookId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "webhook_requests",
                    filter: `webhook_id=eq.${webhookId}`,
                },
                handleNewRequest
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, webhookId]);

    if (requests.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <div>
                    <h3 className="text-xl font-semibold mb-2">
                        Waiting for requests...
                    </h3>
                    <p className="text-muted-foreground">
                        Send an HTTP request to your webhook URL to see it
                        appear here in real-time.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <Accordion type="single" collapsible className="w-full">
                {requests.map((req) => (
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
                                    <h4 className="font-semibold mb-2">Body</h4>
                                    <SyntaxHighlighter
                                        language="json"
                                        style={vscDarkPlus}
                                        customStyle={{
                                            borderRadius: "0.375rem",
                                            margin: 0,
                                        }}
                                    >
                                        {JSON.stringify(
                                            JSON.parse(req.body || "{}"),
                                            null,
                                            2
                                        )}
                                    </SyntaxHighlighter>
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
                ))}
            </Accordion>
        </ScrollArea>
    );
}
