import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

export function ERPLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]"
      style={{
        backgroundImage: `radial-gradient(at 0% 0%, rgba(91,62,255,0.04) 0px, transparent 50%),
                          radial-gradient(at 100% 100%, rgba(155,81,224,0.04) 0px, transparent 50%)`
      }}
    >
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "pl-[88px]" : "pl-[280px]"
        )}
      >
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
