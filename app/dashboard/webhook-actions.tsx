"use client";

import { useState, useTransition } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/app/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { updateWebhook, deleteWebhook } from "@/app/dashboard/actions";
import { type getWebhooks } from "@/app/dashboard/actions";
import { toast } from "sonner";

// Определяем тип один раз, чтобы его переиспользовать
type Webhook = Awaited<ReturnType<typeof getWebhooks>>[0];

// Мы просто говорим,
// что компонент ожидает получить один объект типа Webhook.
interface WebhookActionsProps {
    webhook: Webhook;
}

export function WebhookActions({ webhook }: WebhookActionsProps) {
    // Состояния для управления видимостью диалоговых окон
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    // useTransition для отслеживания состояния отправки формы и предотвращения двойных кликов
    const [isPending, startTransition] = useTransition();

    // Клиентская функция-обработчик для формы обновления имени
    const handleUpdateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы)
        const formData = new FormData(event.currentTarget);
        // Оборачиваем вызов Server Action в startTransition
        startTransition(async () => {
            const result = await updateWebhook(formData);
            if (result?.error) {
                toast.error("Error updating webhook", {
                    description: result.error,
                });
            } else {
                setEditOpen(false);
                toast.success("Webhook updated!", {
                    description: "Your changes have been saved successfully.",
                });
            }
        });
    };

    // Обработчик для формы удаления
    const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            // Server Action `deleteWebhook` сам выполнит redirect, поэтому здесь не нужно ничего делать после вызова
            await deleteWebhook(formData);
        });
    };

    return (
        <>
            {/* Выпадающее меню с опциями */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={() => setDeleteOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Диалоговое окно для редактирования */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Webhook</DialogTitle>
                        <DialogDescription>
                            Update the name and custom path for your webhook.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit} className="grid gap-4">
                        <input type="hidden" name="id" value={webhook.id} />

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={webhook.name ?? ""}
                                placeholder="Webhook name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="custom_path">Custom Path</Label>
                            <Input
                                id="custom_path"
                                name="custom_path"
                                defaultValue={webhook.custom_path ?? ""}
                                placeholder="your-path"
                            />
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            ⚠️ Changing the custom path will delete all request
                            history.
                        </p>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Диалоговое окно для подтверждения удаления */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your webhook and all of
                            its requests.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <form onSubmit={handleDeleteSubmit}>
                            <input type="hidden" name="id" value={webhook.id} />
                            {/* `asChild` позволяет нам использовать нашу кастомную Button внутри AlertDialogAction */}
                            <AlertDialogAction asChild>
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Yes, delete"
                                    )}
                                </Button>
                            </AlertDialogAction>
                        </form>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
