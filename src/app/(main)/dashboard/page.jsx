'use client';

import BarChart from "@/components/barchart";
import PieChart from "@/components/pie";
import SummaryCards from "@/components/summary";





export default function DashboardPage() {
  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart />
        <PieChart />
      </div>
    </main>
  );
}