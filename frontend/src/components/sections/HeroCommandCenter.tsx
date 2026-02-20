import React from 'react';

export default function HeroCommandCenter() {
  return (
    <div className="flex items-start justify-between w-full mb-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight">
            Command Center
          </h1>
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#10B981]/10 to-[#10B981]/05 border border-[#10B981]/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#10B981] leading-none">Live</span>
          </div>
        </div>
        <p className="text-[#64748B] text-[15px]">
          Real-time insights and intelligent workspace
        </p>
      </div>
    </div>
  );
}
