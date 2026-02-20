"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Package,
  FolderKanban,
  SquareCheckBig,
  Calendar,
  ChartColumn,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem = ({ icon: Icon, label, href, isActive }: NavItemProps) => {
  return (
    <li>
      <a
        href={href}
        className={cn(
          "group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 text-[15px] font-medium",
          isActive
            ? "bg-gradient-to-r from-[#5B3EFF] to-[#9B51E0] text-white shadow-lg shadow-[#5B3EFF]/30"
            : "text-[#64748B] hover:bg-[#5B3EFF]/08 hover:text-[#0F172A]"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 transition-colors",
            isActive ? "text-white" : "text-[#64748B] group-hover:text-[#0F172A]"
          )}
        />
        <span>{label}</span>
      </a>
    </li>
  );
};

const NavigationSidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", isActive: true },
    { icon: Users, label: "CRM", href: "/crm" },
    { icon: FileText, label: "Quotes", href: "/quotes" },
    { icon: Receipt, label: "Invoices", href: "/invoices" },
    { icon: Users, label: "Clients", href: "/clients" },
    { icon: Package, label: "Products", href: "/products" },
    { icon: FolderKanban, label: "Projects", href: "/projects" },
    { icon: SquareCheckBig, label: "Tasks", href: "/tasks" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: ChartColumn, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-50 flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-full bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_8px_32px_rgba(91,62,255,0.12)] flex flex-col overflow-hidden">
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[36px] w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B3EFF] to-[#9B51E0] flex items-center justify-center shadow-lg shrink-0">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-[#0F172A] text-lg tracking-tight whitespace-nowrap">
                RIZAT ERP
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-none">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                label={isCollapsed ? "" : item.label}
                href={item.href}
                isActive={item.isActive}
              />
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle Footer */}
        <div className="p-3 border-t border-white/20">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl hover:bg-[#5B3EFF]/08 transition-colors text-[#64748B] hover:text-[#0F172A]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NavigationSidebar;