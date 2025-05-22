import { Metadata } from "next";
import { CurrencyTracker } from "@/components/context/common/currency-tracker";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardToolbar } from "@/components/ui/dashboard-toolbar";

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
        <main className="p-4">
          <div className="flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <DashboardToolbar />
              <CurrencyTracker />
            </div>
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
