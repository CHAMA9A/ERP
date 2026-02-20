"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const revenueData = [
  { name: "Jan", value: 42000 },
  { name: "Feb", value: 45000 },
  { name: "Mar", value: 41000 },
  { name: "Apr", value: 48000 },
  { name: "May", value: 52000 },
  { name: "Jun", value: 49000 },
  { name: "Jul", value: 58000 },
  { name: "Aug", value: 65000 },
  { name: "Sep", value: 68000 },
  { name: "Oct", value: 72000 },
  { name: "Nov", value: 70000 },
  { name: "Dec", value: 78000 },
];

const conversionData = [
  { name: "Mon", quotes: 28, invoices: 22 },
  { name: "Tue", quotes: 35, invoices: 18 },
  { name: "Wed", quotes: 20, invoices: 25 },
  { name: "Thu", quotes: 32, invoices: 30 },
  { name: "Fri", quotes: 25, invoices: 20 },
  { name: "Sat", quotes: 18, invoices: 28 },
  { name: "Sun", quotes: 30, invoices: 24 },
];

const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Revenue Analytics Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[24px] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
        <div className="relative glass-card rounded-[24px] p-7 transition-all">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-1 leading-tight tracking-tight">
              Revenue Analytics
            </h3>
            <p className="text-sm text-muted-foreground">
              Monthly performance overview
            </p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B3EFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#5B3EFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="rgba(226, 232, 240, 0.5)" 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 10px 25px -5px rgba(91, 62, 255, 0.12)',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#5B3EFF" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quotes vs Invoices Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[24px] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
        <div className="relative glass-card rounded-[24px] p-7 transition-all">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-1 leading-tight tracking-tight">
              Quotes vs Invoices
            </h3>
            <p className="text-sm text-muted-foreground">
              Conversion tracking
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} barGap={12}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="rgba(226, 232, 240, 0.5)" 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(91, 62, 255, 0.03)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 10px 25px -5px rgba(91, 62, 255, 0.12)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar 
                  dataKey="quotes" 
                  fill="#5B3EFF" 
                  radius={[6, 6, 0, 0]} 
                  barSize={12}
                />
                <Bar 
                  dataKey="invoices" 
                  fill="#10B981" 
                  radius={[6, 6, 0, 0]} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center gap-6 mt-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;