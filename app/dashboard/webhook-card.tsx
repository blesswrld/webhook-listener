"use client";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/app/components/ui/copy-button";
import { WebhookActions } from "@/app/dashboard/webhook-actions";
import Link from "next/link";
import { type getWebhooks } from "@/app/dashboard/actions";

type Webhook = Awaited<ReturnType<typeof getWebhooks>>[0];

interface WebhookCardProps {
    hook: Webhook;
    isSelected: boolean;
    webhookUrl: string; // <-- Теперь мы принимаем готовый URL
}

export function WebhookCard({
    hook,
    isSelected,
    webhookUrl,
}: WebhookCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-lg border p-3 text-sm transition-colors flex items-start justify-between gap-2",
                isSelected
                    ? "bg-accent/100 text-accent-foreground border-accent shadow-sm"
                    : "hover:bg-accent/50 border-border/50"
            )}
        >
            {/* Левая часть */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/dashboard?id=${hook.id}`}
                    className="font-medium hover:underline break-all"
                >
                    {hook.name || "Untitled Webhook"}
                </Link>
                <div
                    className="text-xs text-slate-300 dark:text-slate-400 break-all"
                    title={webhookUrl}
                >
                    {webhookUrl}
                </div>
            </div>

            {/* Правая часть (копирование и меню) */}
            <div className="flex shrink-0 items-center gap-1">
                <CopyButton textToCopy={webhookUrl} />
                <WebhookActions webhook={hook} />
            </div>
        </div>
    );
}
