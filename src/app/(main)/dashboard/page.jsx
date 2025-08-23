'use client';

import BarChart from "@/components/barchart";
import PieChart from "@/components/pie";
import SummaryCards from "@/components/summary";





export default function DashboardPage() {
  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold 
  bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 
  dark:from-lime-400 dark:via-green-400 dark:to-emerald-300 
  bg-clip-text text-transparent drop-shadow-sm border-b-2 pb-5">
  Dashboard Overview
</h1>

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