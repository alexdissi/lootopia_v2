"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { renderIcon } from "@/lib/icon-map";
import type { NavItem } from "./app-sidebar";

export function NavAdmin({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          pathname === item.url || pathname.startsWith(`${item.url}/`);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link href={item.url} className="transition-all duration-200">
                {renderIcon(item.icon, "size-4")}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
