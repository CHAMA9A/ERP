import React from 'react';
import { Sparkles, ArrowUpRight, Activity } from 'lucide-react';

const AIInsightsSection = () => {
  return (
    <div className="relative group lg:col-span-2">
      {/* Glowing secondary gradient backdrop glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5B3EFF] to-[#9B51E0] rounded-[24px] opacity-20 group-hover:opacity-30 blur-2xl transition-all duration-500"></div>
      
      {/* 1px Gradient Border Wrapper */}
      <div className="relative bg-gradient-to-br from-[#5B3EFF] to-[#9B51E0] rounded-[24px] p-[1px]">
        {/* White Frosted Glass Background Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[23px] p-8 h-full">
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles 
                  className="w-5 h-5 text-[#5B3EFF]" 
                  strokeWidth={2}
                />
                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  AI Insights
                </h3>
              </div>
              <p className="text-sm text-[#64748B]">
                Your business performance at a glance
              </p>
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Conversion Rate Metric */}
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                Conversion Rate
              </p>
              <p className="text-[30px] font-bold text-[#0F172A] leading-tight">
                84.2%
              </p>
              <p className="text-[12px] text-[#10B981] font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +5.2%
              </p>
            </div>

            {/* Avg Deal Size Metric */}
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                Avg Deal Size
              </p>
              <p className="text-[30px] font-bold text-[#0F172A] leading-tight">
                $12.4K
              </p>
              <p className="text-[12px] text-[#10B981] font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +12.8%
              </p>
            </div>

            {/* Active Deals Metric */}
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                Active Deals
              </p>
              <p className="text-[30px] font-bold text-[#0F172A] leading-tight">
                127
              </p>
              <p className="text-[12px] text-[#9B51E0] font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                +18
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsSection;