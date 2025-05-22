import { Metadata } from "next";
import { CurrencyTracker } from "@/components/context/common/currency-tracker";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ToggleTheme from "@/components/ui/toggle-theme";

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
        <main className="p-4">
          <div className="flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <ToggleTheme />
              <CurrencyTracker />
            </div>
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
