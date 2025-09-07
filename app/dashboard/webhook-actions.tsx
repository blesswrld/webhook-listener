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
import { updateWebhookName, deleteWebhook } from "@/app/dashboard/actions";

// Определяем интерфейс для пропсов, чтобы компонент знал, какие данные о вебхуке он получит
interface WebhookActionsProps {
    webhook: {
        id: string;
        name: string | null;
    };
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
            const result = await updateWebhookName(formData);
            if (result?.error) {
                alert(result.error); // Показываем ошибку, если она есть
            } else {
                setEditOpen(false); // Закрываем диалоговое окно при успехе
            }
        });
    };

    // Клиентская функция-обработчик для формы удаления
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
            {/* Выпадающее меню с опциями для каждого вебхука */}
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
                        <span>Edit Name</span>
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

            {/* Диалоговое окно для редактирования имени */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Webhook Name</DialogTitle>
                        <DialogDescription>
                            Give your webhook a name to easily identify it.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Форма вызывает наш клиентский обработчик onSubmit */}
                    <form
                        onSubmit={handleUpdateSubmit}
                        className="grid gap-4 py-4"
                    >
                        {/* Скрытое поле для передачи ID вебхука в Server Action */}
                        <input type="hidden" name="id" value={webhook.id} />
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={webhook.name ?? ""}
                                className="col-span-3"
                            />
                        </div>
                        <DialogFooter>
                            {/* Кнопка отключается, пока форма отправляется (isPending === true) */}
                            <Button type="submit" disabled={isPending}>
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
                            This action cannot be undone. This will permanently
                            delete your webhook and all of its associated
                            requests.
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
                                <Button type="submit" disabled={isPending}>
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
