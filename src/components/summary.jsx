'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SummaryCards({reports}) {
  const totalReports = reports.length;
  const totalViews = reports.reduce((sum, r) => sum + r.views, 0);
  const pdfReports = reports.filter(r => r.type === 'pdf').length;
  const imageReports = reports.filter(r => r.type === 'image').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-outfit">
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl dark:bg-white/5 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide text-gray-900 dark:text-gray-100">
            Total Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 animate-pulse">
          {totalReports}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl dark:bg-white/5 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide text-gray-900 dark:text-gray-100">
            Total Views
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 animate-pulse">
          {totalViews}
        </CardContent>
      </Card>


      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl dark:bg-white/5 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide text-gray-900 dark:text-gray-100">
            PDF Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 animate-pulse">
          {pdfReports}
        </CardContent>
      </Card>


      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105 rounded-2xl dark:bg-white/5 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-wide text-gray-900 dark:text-gray-100">
            Image Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 animate-pulse">
          {imageReports}
        </CardContent>
      </Card>

    </div>
  );
}
