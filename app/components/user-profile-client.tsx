"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { signOut } from "@/app/login/actions";
import { LogOut, Edit, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";

// Определяем тип для данных пользователя, которые мы будем передавать
type UserProfileData = {
    isGithubUser: boolean;
    avatarUrl: string | undefined;
    userName: string | undefined;
    userEmail: string | undefined;
    fallbackText: string;
};

export function UserProfileClient({
    userProfileData,
}: {
    userProfileData: UserProfileData;
}) {
    const { isGithubUser, avatarUrl, userName, userEmail, fallbackText } =
        userProfileData;
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    // useTransition для управления состоянием ожидания (pending) при асинхронных операциях
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Обработчик отправки форм (для username и avatar)
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Предотвращаем стандартную перезагрузку страницы
        const formData = new FormData(event.currentTarget);

        // startTransition сообщает React, что мы начинаем обновление, которое может занять время
        startTransition(async () => {
            // Определяем, какая форма была отправлена, по наличию поля 'avatar'
            const isAvatarForm = !!formData.get("avatar");
            const endpoint = isAvatarForm
                ? "/api/profile/avatar"
                : "/api/profile/username";

            try {
                // Отправляем данные формы на наш API Route
                const response = await fetch(endpoint, {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "An unknown error occurred."
                    );
                }

                router.refresh();
                if (isAvatarForm) {
                    setEditDialogOpen(false); // Закрываем диалог после загрузки аватара
                }

                toast.success("Profile updated!", {
                    description: `Your new ${
                        isAvatarForm ? "avatar" : "username"
                    } has been saved.`,
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast.error("Profile update failed", {
                    description: error.message,
                });
            }
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={avatarUrl}
                                alt={userName || userEmail || "User avatar"}
                            />
                            <AvatarFallback>{fallbackText}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {userName || "My Profile"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {userEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
                        <Edit className="h-4 w-4" /> {/* Иконка Edit */}
                        <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <form action={signOut}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <button className="w-full flex items-center">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Диалоговое окно для редактирования профиля */}
            <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            {isGithubUser
                                ? "Your profile data is synced from GitHub."
                                : "Make changes to your profile here."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Показываем формы только если пользователь вошел не через GitHub */}
                    {!isGithubUser && (
                        <div className="grid gap-6 py-4">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="username"
                                        className="text-right"
                                    >
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        className="col-span-2"
                                        required
                                        minLength={2}
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                            </form>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="avatar"
                                        className="text-right"
                                    >
                                        Avatar
                                    </Label>
                                    <Input
                                        id="avatar"
                                        name="avatar"
                                        type="file"
                                        accept="image/*"
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Upload & Save"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
