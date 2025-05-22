"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { renderIcon } from "@/lib/icon-map";
import type { NavItem } from "./app-sidebar";

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        let isActive = false;

        if (item.url === "/dashboard") {
          isActive = pathname === "/dashboard";
        } else {
          isActive =
            pathname === item.url ||
            (pathname.startsWith(item.url + "/") && item.url !== "/dashboard");
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link href={item.url} className="transition-all duration-200">
                {renderIcon(item.icon, "size-4")}
                <span>{item.title}</span>

                {item.title === "Chasses" && (
                  <SidebarMenuBadge className="bg-primary/10 text-primary">
                    3
                  </SidebarMenuBadge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
