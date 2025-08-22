'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { reports } from '@/app/data/reportdata';

export default function SummaryCards() {
  const totalReports = reports.length;
  const totalViews = reports.reduce((sum, r) => sum + r.views, 0);
  const pdfReports = reports.filter(r => r.type === 'pdf').length;
  const imageReports = reports.filter(r => r.type === 'image').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-outfit">
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide">Total Reports</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold animate-pulse">{totalReports}</CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide">Total Views</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold animate-pulse">{totalViews}</CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide">PDF Reports</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold animate-pulse">{pdfReports}</CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide">Image Reports</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold animate-pulse">{imageReports}</CardContent>
      </Card>
    </div>
  );
}