import { signIn, signUp, signInWithGithub } from "./actions";
import { Button } from "@/app/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Github } from "lucide-react";

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2-xl">Login / Sign Up</CardTitle>
                    <CardDescription>
                        Enter your email or use a provider to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {/* Форма для GitHub */}
                    <form>
                        <Button
                            formAction={signInWithGithub}
                            variant="outline"
                            className="w-full"
                        >
                            <Github className="mr-2 h-4 w-4" />
                            Continue with GitHub
                        </Button>
                    </form>

                    {/* Разделитель */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Форма для Email */}
                    <form>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="******"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button formAction={signIn} className="flex-1">
                                    Sign In
                                </Button>
                                <Button
                                    formAction={signUp}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </div>
                    </form>
                    {searchParams?.message && (
                        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-lg">
                            {searchParams.message}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
