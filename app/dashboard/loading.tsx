import { Skeleton } from "@/app/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="h-screen w-full flex flex-col">
            {/* Скелет для Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shrink-0">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-40 hidden md:block" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    {/* <-- Скелетон для ThemeToggle */}
                </div>
            </header>

            <div className="grid md:grid-cols-[300px_1fr] flex-1 overflow-hidden">
                {/* Скелет для Sidebar */}
                <aside className="border-r bg-secondary/40 flex flex-col p-4 gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </aside>

                {/* Скелет для Main Content */}
                <main className="p-4 md:p-6 h-full overflow-hidden">
                    <div className="flex h-full items-center justify-center text-center">
                        <p className="text-muted-foreground">
                            Loading dashboard...
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
