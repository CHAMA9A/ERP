"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Lock,
  FileText,
  CheckSquare,
  Users,
  UserCog,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Planning", url: "/planning", icon: Calendar },
  { title: "Coffre-fort", url: "/coffre-fort", icon: Lock },
  {
    title: "Devis",
    url: "/devis",
    icon: FileText,
    children: [
      { title: "Liste des devis", url: "/devis" },
      { title: "Nouveau devis", url: "/devis/nouveau" },
      { title: "Catalogue", url: "/devis/catalogue" },
    ],
  },
  { title: "Tâches", url: "/taches", icon: CheckSquare },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Utilisateurs", url: "/utilisateurs", icon: UserCog },
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          R
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight text-foreground">
            RIZAT
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.url === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.url);

          const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;

          return (
            <div key={item.url}>
              <Link
                href={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>

              {!collapsed && hasChildren && isActive && (
                <div className="mt-1 space-y-0.5 pl-9">
                  {(item as any).children.map((child: { title: string; url: string }) => {
                    const childActive = pathname === child.url;

                    return (
                      <Link
                        key={child.url}
                        href={child.url}
                        className={cn(
                          "block rounded-md px-2 py-1 text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-foreground",
                          childActive && "bg-accent/70 text-accent-foreground"
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
