import { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar userRole={session?.user.role} />
      <main className="w-full">
        <Header />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
