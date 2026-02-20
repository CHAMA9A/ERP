import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Lock,
  FileText,
  CheckSquare,
  Users,
  UserCog,
  Settings,
  ChevronRight,
  ChevronLeft,
  Package,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Planning", url: "/planning", icon: Calendar },
  { title: "Coffre-fort", url: "/coffre-fort", icon: Lock },
  {
    title: "Devis",
    url: "/devis",
    icon: FileText,
    children: [
      { title: "Liste de devis", url: "/devis" },
      { title: "Catalogue", url: "/catalog" },
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

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "??";

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-50 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[256px]"
      )}
    >
      <div className="h-full glass-sidebar rounded-[20px] flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[36px] w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B3EFF] to-[#9B51E0] flex items-center justify-center shadow-lg shrink-0">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            {!collapsed && (
              <div>
                <div className="text-[#0F172A] font-bold text-base leading-tight tracking-tight">RIZAT</div>
                <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-widest">ERP</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {navItems.map((item) => {
            const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;
            const childUrls = hasChildren
              ? (item as any).children.map((c: { url: string }) => c.url)
              : [];
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.url) || childUrls.includes(pathname);

            return (
              <div key={item.url}>
                <Link
                  to={item.url}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-[#5B3EFF] to-[#9B51E0] text-white shadow-lg shadow-[#5B3EFF]/30"
                      : "text-[#64748B] hover:bg-[#5B3EFF]/08 hover:text-[#0F172A]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#64748B] group-hover:text-[#0F172A]"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {hasChildren && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            isActive ? "rotate-90 text-white/70" : "text-[#64748B]"
                          )}
                        />
                      )}
                    </>
                  )}
                </Link>

                {/* Children */}
                {!collapsed && hasChildren && isActive && (
                  <div className="mt-1 mb-1 ml-4 pl-4 space-y-0.5 border-l border-[#5B3EFF]/20">
                    {(item as any).children.map((child: { title: string; url: string }) => {
                      const childActive = pathname === child.url;
                      return (
                        <Link
                          key={child.url}
                          to={child.url}
                          className={cn(
                            "block rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150",
                            childActive
                              ? "text-[#5B3EFF] bg-[#5B3EFF]/08"
                              : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#5B3EFF]/08"
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

          {/* Footer */}
          <div className="p-3 border-t border-white/20">
            {!collapsed && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-[#5B3EFF]/08 transition-colors mb-2">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-[#5B3EFF] to-[#9B51E0] flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#0F172A] text-xs font-semibold truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "—"}
                  </div>
                  <div className="text-[#64748B] text-[10px] truncate capitalize">
                    {user?.role ?? ""}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className="text-[#94A3B8] hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            {collapsed && (
              <button
                onClick={handleLogout}
                title="Déconnexion"
                className="w-full flex items-center justify-center p-2 rounded-xl text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors mb-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl hover:bg-[#5B3EFF]/08 transition-colors text-[#64748B] hover:text-[#0F172A]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          </div>
      </div>
    </aside>
  );
}
