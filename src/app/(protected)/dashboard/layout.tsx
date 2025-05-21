import { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CurrencyTracker } from "@/components/context/common/currency-tracker";

export const metadata: Metadata = {
  title: "Lootopia",
  description: "Lootopia figenn",
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
        <main className="p-4">
          <div className="flex items-center justify-between">
            <SidebarTrigger />
            <CurrencyTracker />
          </div>

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
