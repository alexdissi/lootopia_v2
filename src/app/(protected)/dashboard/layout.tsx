import { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { DashboardToolbar } from "@/components/ui/dashboard-toolbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Lootopia",
  description: "Lootopia",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardToolbar />
        <main className="p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
