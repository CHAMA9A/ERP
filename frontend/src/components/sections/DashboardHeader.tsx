import React from 'react';
import { Search, Bell } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 mt-4 mx-8 mb-0">
      {/* Search Input Section */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm"></div>
          <div className="relative flex items-center gap-3 px-5 py-3">
            <Search className="w-5 h-5 text-[#64748B]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#64748B]/60 text-[15px] w-full outline-none font-sans text-[#0F172A]"
            />
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-3 rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 hover:bg-white/80 transition-all shadow-sm cursor-pointer group">
          <Bell className="w-5 h-5 text-[#0F172A]" strokeWidth={2} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#10B981] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Avatar */}
        <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full w-10 h-10 ring-2 ring-[#5B3EFF]/20 ring-offset-2 cursor-pointer">
          <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-[#5B3EFF] to-[#9B51E0] text-white font-semibold text-sm">
            RZ
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
