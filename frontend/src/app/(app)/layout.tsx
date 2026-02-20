"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { Topbar } from "@/components/layouts/Topbar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={cn(
          "flex flex-col transition-all duration-200",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

