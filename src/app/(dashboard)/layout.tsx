import { ReactNode } from "react";
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { getValidatedSessionWithRole } from "@/lib/auth/getValidatedSession";
import AppSidebar from "@/components/layout/Sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    const { session, isAdmin } = await getValidatedSessionWithRole();
    if (!session) redirect("/login");

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar isAdmin={isAdmin} />
            <main className="w-full">
                <Header />
                <div className="flex-1 overflow-auto p-6">{children}</div>
            </main>
        </SidebarProvider>
    );
}
