import { Metadata } from "next";
import { Suspense } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { LoaderPage } from "@/components/ui/loader";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
    <Suspense fallback={<LoaderPage />}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="p-4">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
