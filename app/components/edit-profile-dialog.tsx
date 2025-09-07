"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    updateUsername,
    uploadAvatar,
} from "@/app/components/user-profile-actions";

export function EditProfileDialog({
    children, // <-- Принимаем children
    isGithubUser,
}: {
    children: React.ReactNode; // <-- Тип для children
    isGithubUser: boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        {isGithubUser
                            ? "Your profile data is synced from GitHub and cannot be edited here."
                            : "Make changes to your profile here. Click save when you're done."}
                    </DialogDescription>
                </DialogHeader>

                {!isGithubUser && (
                    <div className="grid gap-6 py-4">
                        {/* Форма для смены имени */}
                        <form
                            action={async (formData) => {
                                await updateUsername(formData);
                            }}
                        >
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
                                />
                                <Button type="submit" size="sm">
                                    Save
                                </Button>
                            </div>
                        </form>

                        {/* Форма для загрузки аватара */}
                        <form
                            action={async (formData) => {
                                await uploadAvatar(formData);
                                setOpen(false); // Закрываем диалог после загрузки
                            }}
                        >
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="avatar" className="text-right">
                                    Avatar
                                </Label>
                                <Input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button type="submit">Upload & Save</Button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
