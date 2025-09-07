"use client"; // <-- Делаем его клиентским компонентом

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
import { LogOut } from "lucide-react";
import { EditProfileDialog } from "@/app/components/edit-profile-dialog";
import { Edit } from "lucide-react"; // <-- Добавляем импорт Edit

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

    return (
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

                {/* Редактирование профиля */}
                <EditProfileDialog isGithubUser={isGithubUser}>
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                    </div>
                </EditProfileDialog>

                {/* РАЗДЕЛИТЕЛЬ */}
                <DropdownMenuSeparator />

                {/* Выход */}
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
    );
}
