"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  CameraIcon,
  Candy,
  ClipboardListIcon,
  Coins,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

import { NavUser } from "./nav-user";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";

import { CurrencyTracker } from "../context/common/currency-tracker";
import { UserRole } from "../../../generated/prisma";

interface ExtendedUser extends User {
  role?: UserRole;
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Payments",
      url: "/dashboard/payment",
      icon: Coins,
    },
    {
      title: "Hunts",
      url: "/dashboard/hunts",
      icon: Candy,
    },
  ],
  navAdmin: [
    {
      title: "Utilisateurs",
      url: "dashboard/admin",
      icon: UsersIcon,
    },
    {
      title: "Paramètres",
      url: "dashboard/admin/settings",
      icon: SettingsIcon,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
};
function NavAdmin({ items }: { items: typeof data.navAdmin }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
          <ShieldIcon className="h-4 w-4 mr-1" />
          Administration
        </SidebarMenuButton>
      </SidebarMenuItem>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <a href={item.url}>
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = authClient.useSession();
  const isAdmin = (session?.data?.user as ExtendedUser)?.role === "ADMIN";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Lootopia Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {isAdmin && <NavAdmin items={data.navAdmin} />}
      </SidebarContent>
      <SidebarFooter>
        <CurrencyTracker />
        <NavUser user={session?.data?.user ?? null} />
      </SidebarFooter>
    </Sidebar>
  );
}
