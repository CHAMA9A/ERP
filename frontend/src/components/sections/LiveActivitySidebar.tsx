import React from 'react';
import { Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'quote' | 'invoice' | 'milestone' | 'client';
  title: string;
  user: string;
  time: string;
  statusColor: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'quote',
    title: 'New quote created',
    user: 'Sarah Chen',
    time: '2 min ago',
    statusColor: 'bg-[#5B3EFF]', // Primary
  },
  {
    id: '2',
    type: 'invoice',
    title: 'Invoice paid',
    user: 'Acme Corp',
    time: '15 min ago',
    statusColor: 'bg-[#10B981]', // Secondary
  },
  {
    id: '3',
    type: 'milestone',
    title: 'Project milestone completed',
    user: 'Dev Team',
    time: '1 hour ago',
    statusColor: 'bg-[#9B51E0]', // Accent
  },
  {
    id: '4',
    type: 'client',
    title: 'New client onboarded',
    user: 'TechStart Inc',
    time: '3 hours ago',
    statusColor: 'bg-[#F1C40F]', // Chart-4 color used in activity
  },
];

export default function LiveActivitySidebar() {
  return (
    <div className="relative h-full">
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[24px] p-6 hover:shadow-[0_20px_50px_rgba(91,62,255,0.1)] transition-all h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-[#5B3EFF]" />
          <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Live Activity</h3>
        </div>

        {/* Timeline List */}
        <div className="space-y-6 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[3px] top-3 bottom-0 w-[1px] bg-slate-100 hidden" />
          
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3 relative group">
              {/* Status Dot */}
              <div className="relative flex flex-col items-center">
                <div 
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.statusColor} ring-4 ring-white/50 z-10`} 
                />
                {index !== activities.length - 1 && (
                  <div className="w-[1px] h-full bg-slate-100/50 absolute top-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm font-semibold text-[#0F172A] leading-tight mb-0.5">
                  {activity.title}
                </p>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#64748B]">
                    {activity.user}
                  </span>
                  <span className="text-[11px] font-medium text-[#64748B]/60 mt-0.5">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: View All link if space permits in real app */}
        <div className="mt-8 pt-4 border-t border-slate-100/50">
          <button className="text-[13px] font-semibold text-[#5B3EFF] hover:text-[#9B51E0] transition-colors">
            View all updates
          </button>
        </div>
      </div>
    </div>
  );
}