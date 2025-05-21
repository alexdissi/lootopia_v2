import * as React from "react";
import { ArrowUpCircle } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavAdmin } from "./nav-admin";
import { NavUser } from "./nav-user";
import { CurrencyTracker } from "../context/common/currency-tracker";
import { UserRole } from "../../../generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type NavItem = {
  title: string;
  url: string;
  icon: string;
  items?: {
    title: string;
    url: string;
  }[];
  isActive?: boolean;
};

export const navItems = {
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Chasses",
      url: "/dashboard/hunts",
      icon: "candy",
    },
    {
      title: "Magasin",
      url: "/dashboard/shop",
      icon: "shopping-bag",
    },
    {
      title: "Paiements",
      url: "/dashboard/payment",
      icon: "coins",
    },
    {
      title: "Mon Profil",
      url: "/dashboard/profile",
      icon: "user",
    },
  ],
  admin: [
    {
      title: "Utilisateurs",
      url: "/dashboard/admin",
      icon: "users",
    },
    {
      title: "Paramètres",
      url: "/dashboard/admin/settings",
      icon: "settings",
    },
  ],
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = (session?.user?.role as UserRole) === UserRole.ADMIN;

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10"
            >
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ArrowUpCircle className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-lg">Lootopia</span>
                  <span className="text-xs text-muted-foreground">
                    Plateforme SaaS
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={navItems.main} />
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavAdmin items={navItems.admin} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 pt-2">
        <NavUser user={session?.user ?? null} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
