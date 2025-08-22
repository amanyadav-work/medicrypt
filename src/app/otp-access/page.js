
'use client';
import React, { useState, Suspense } from 'react';
import useFetch from '@/hooks/useFetch';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function ReportContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const { refetch, isLoading } = useFetch({
    url: '/api/otp-access',
    method: 'POST',
    auto: false,
    onSuccess: (res) => {
      if (res.error) {
        setError(res.error);
        setReport(null);
      } else {
        setReport(res);
        setError('');
      }
    },
    onError: (err) => {
      setError(err.message || 'Error');
      setReport(null);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);
    await refetch({ payload: { token, otp } });
  };

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-2">OTP Access</h2>
              <input
                type="text"
                placeholder="Enter token from link"
                value={token}
                readOnly
                className="border rounded px-3 py-2 bg-muted"
                required
              />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="border rounded px-3 py-2"
                required
              />
              <Button type="submit" disabled={isLoading}>Submit</Button>
              {error && <div className="mt-4 text-center text-lg font-semibold text-destructive">{error}</div>}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Report UI after successful OTP validation
  return (
    <div className="flex flex-col items-center min-h-[60vh] py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-2 gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{report.name || 'Report'}</h2>
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              {report.owner && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  {report.owner.avatar && (
                    <img src={report.owner.avatar} alt="Owner Avatar" width={28} height={28} className="rounded-full border object-cover" style={{ borderRadius: '50%', objectFit: 'cover', width: 36, height: 36 }} />
                  )}
                  Owner: <span className="font-medium">{report.owner.name || report.owner.email}</span>
                </span>
              )}
              <span className="text-sm text-muted-foreground">Views: <span className="font-medium">{report.views ?? 0}</span></span>
            </div>
          </div>
          {report.desc && (
            <div className="text-muted-foreground mb-2 text-base">{report.desc}</div>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground mb-2">
            <span>Created: {report.createdAt ? new Date(report.createdAt).toLocaleString() : '-'}</span>
            <span>Updated: {report.updatedAt ? new Date(report.updatedAt).toLocaleString() : '-'}</span>
          </div>
          {report.type === 'pdf' ? (
            <div className="w-full aspect-[4/3] flex items-center justify-center">
              <iframe
                src={report.url}
                className="w-full h-[500px] border rounded-lg shadow-sm transition-all duration-200"
                title="PDF Report"
                allow="autoplay"
              />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <img
                src={report.url}
                alt="Report Image"
                width={600}
                height={800}
                className="rounded-lg shadow-sm object-contain max-h-[500px] w-auto"
                style={{ maxHeight: '500px', width: 'auto' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function OtpAccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><div className="animate-pulse w-32 h-8 rounded bg-muted" /></div>}>
      <ReportContent />
    </Suspense>
  );
}