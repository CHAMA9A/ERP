import DashboardHeader from "@/components/sections/DashboardHeader";
import HeroCommandCenter from "@/components/sections/HeroCommandCenter";
import LiveActivitySidebar from "@/components/sections/LiveActivitySidebar";
import StatsGrid from "@/components/sections/StatsGrid";
import AnalyticsCharts from "@/components/sections/AnalyticsCharts";

const Index = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-8">
        <DashboardHeader />
      </div>

      {/* Page Title + Quick Actions */}
      <HeroCommandCenter />

        {/* Stats Grid */}
        <StatsGrid />

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* Live Activity */}
        <div className="mt-8">
          <LiveActivitySidebar />
        </div>
    </div>
  );
};

export default Index;
