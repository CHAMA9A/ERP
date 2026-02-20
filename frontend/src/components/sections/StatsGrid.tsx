import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, FolderKanban, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

interface StatItemProps {
  label: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
}

const StatCard = ({ label, value, trend, trendType, icon, iconBgColor, iconTextColor }: StatItemProps) => {
  const isPositive = trendType === 'positive';
  const isNeutral = trendType === 'neutral';

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5B3EFF] to-[#9B51E0] rounded-[20px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] p-6 hover:shadow-[0_20px_50px_rgba(91,62,255,0.15)] transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#64748B] mb-2">{label}</p>
            <h3 className="text-[30px] font-bold text-[#0F172A] tracking-tight leading-tight">
              {value}
            </h3>
          </div>
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${iconBgColor} ${iconTextColor} ring-1 ring-white/50 flex items-center justify-center`}>
            {icon}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
            isNeutral ? 'bg-[#64748B]/10' : isPositive ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'
          }`}>
            {!isNeutral && (isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-[#EF4444]" />
            ))}
            <span className={`text-xs font-semibold ${
              isNeutral ? 'text-[#64748B]' : isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {trend}
            </span>
          </div>
          <span className="text-xs text-[#64748B] font-medium">vs mois dernier</span>
        </div>
      </div>
    </div>
  );
};

const fmt = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M €'
    : n >= 1_000
    ? (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k €'
    : n.toFixed(2) + ' €';

const fmtPct = (n: number): { label: string; type: 'positive' | 'negative' | 'neutral' } => {
  if (n === 0) return { label: '—', type: 'neutral' };
  return { label: (n > 0 ? '+' : '') + n + '%', type: n > 0 ? 'positive' : 'negative' };
};

interface Stats {
  revenue: { value: number; trend: number };
  clients: { value: number; trend: number };
  quotesInProgress: { value: number; trend: number };
  totalQuotes: { value: number; trend: number };
}

const StatsGrid = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] p-6 h-[155px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#5B3EFF] animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const revenueTrend = fmtPct(stats?.revenue.trend ?? 0);
  const clientsTrend = fmtPct(stats?.clients.trend ?? 0);
  const quotesTrend  = fmtPct(stats?.quotesInProgress.trend ?? 0);
  const totalTrend   = fmtPct(stats?.totalQuotes.trend ?? 0);

  const cards: StatItemProps[] = [
    {
      label: 'Chiffre d\'affaires',
      value: fmt(stats?.revenue.value ?? 0),
      trend: revenueTrend.label,
      trendType: revenueTrend.type,
      icon: <TrendingUp className="w-6 h-6" />,
      iconBgColor: 'from-[#10B981]/10 to-[#10B981]/5',
      iconTextColor: 'text-[#10B981]',
    },
    {
      label: 'Total Clients',
      value: (stats?.clients.value ?? 0).toLocaleString('fr-FR'),
      trend: clientsTrend.label,
      trendType: clientsTrend.type,
      icon: <Users className="w-6 h-6" />,
      iconBgColor: 'from-[#5B3EFF]/10 to-[#5B3EFF]/5',
      iconTextColor: 'text-[#5B3EFF]',
    },
    {
      label: 'Devis en cours',
      value: (stats?.quotesInProgress.value ?? 0).toLocaleString('fr-FR'),
      trend: quotesTrend.label,
      trendType: quotesTrend.type,
      icon: <FileText className="w-6 h-6" />,
      iconBgColor: 'from-[#9B51E0]/10 to-[#9B51E0]/5',
      iconTextColor: 'text-[#9B51E0]',
    },
    {
      label: 'Total Devis',
      value: (stats?.totalQuotes.value ?? 0).toLocaleString('fr-FR'),
      trend: totalTrend.label,
      trendType: totalTrend.type,
      icon: <FolderKanban className="w-6 h-6" />,
      iconBgColor: 'from-[#F1C40F]/10 to-[#F1C40F]/5',
      iconTextColor: 'text-[#F1C40F]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
