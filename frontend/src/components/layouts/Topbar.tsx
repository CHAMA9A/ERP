import { Bell, Search, Menu, ChevronDown, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className={cn(
      "sticky top-0 z-20 flex h-16 items-center justify-between px-6",
      "bg-white/80 backdrop-blur-xl border-b border-border/60",
    )}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-secondary/80 rounded-xl px-3 py-2 w-72 group focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            placeholder="Rechercher..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
          <div className="hidden lg:flex items-center gap-0.5 text-[10px] text-muted-foreground/60 border border-border rounded px-1 py-0.5 font-mono">
            <Command className="h-2.5 w-2.5" />K
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User */}
        <button className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-secondary transition-colors">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            MA
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-foreground leading-tight">Mohamed Ali</div>
            <div className="text-[10px] text-muted-foreground">Admin</div>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
