"use client";

import * as React from "react";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { CurrencyTracker } from "@/components/context/common/currency-tracker";

export function DashboardToolbar() {
  const [notifications, setNotifications] = React.useState(3);

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-2 lg:gap-4">
        <SidebarTrigger className="lg:hidden">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        
        <div className="relative max-w-md hidden sm:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8 w-[200px] md:w-[300px] lg:w-[400px] bg-muted/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CurrencyTracker />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="font-medium">Nouvelle chasse disponible !</p>
                <p className="text-xs text-muted-foreground">La chasse "Trésor de Paris" vient d'être publiée</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="font-medium">Félicitations !</p>
                <p className="text-xs text-muted-foreground">Vous avez gagné 50 couronnes</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="font-medium">Rappel</p>
                <p className="text-xs text-muted-foreground">La chasse "Énigmes de Lyon" commence demain</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-center text-primary">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </div>
  );
}

