import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default async function Home() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
            <h1 className="text-4xl font-bold mb-8">
                Welcome to Webhook Listener!
            </h1>
            <div className="flex gap-4 items-center">
                {user ? (
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Logged in as {user.email}
                        </p>
                        <Button asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </div>
                ) : (
                    <Button asChild>
                        <Link href="/login">Login to Get Started</Link>
                    </Button>
                )}
            </div>
        </main>
    );
}
