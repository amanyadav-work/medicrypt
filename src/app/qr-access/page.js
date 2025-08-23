'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';

function ReportContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const { refetch, isLoading } = useFetch({
    url: '/api/qr-validate',
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
      setError(err.message || 'Something went wrong');
      setReport(null);
    },
  });

  useEffect(() => {
    if (token) {
      refetch({ payload: { token } });
    } else {
      setError('Missing access token');
    }
  }, [token]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full h-screen">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">QR Report Access</h2>
              {isLoading ? (
                <p className="text-muted-foreground">Validating access...</p>
              ) : (
                <p className="text-muted-foreground">Please wait while we validate your token.</p>
              )}
              {error && <div className="mt-4 text-center text-lg font-semibold text-destructive">{error}</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-card border border-border rounded-xl shadow-md p-6 flex flex-col gap-6">
        {/* Owner Info */}
        <div className="flex justify-start gap-5 items-center border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border">
              <Image
                src={report.owner?.avatar || '/window.svg'}
                alt={report.owner?.name || 'User'}
                width={40}
                height={40}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
            <div className="text-sm">
              <div className="font-semibold">{report.owner?.name || 'Unknown'}</div>
              <div className="text-muted-foreground text-xs">{report.owner?.email}</div>
            </div>
          </div>
        </div>

        {/* Report Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">{report.title || 'Untitled Report'}</h2>
          {report.description && <p className="text-muted-foreground text-sm">{report.description}</p>}
          <hr />
          <div className="text-xs text-muted-foreground flex gap-4">
            <span>Views: <strong>{report.views ?? 0}</strong></span>
            <span>Created: {report.createdAt ? format(new Date(report.createdAt), 'PPP') : '-'}</span>
            <span>Updated: {report.updatedAt ? format(new Date(report.updatedAt), 'PPpp') : '-'}</span>
          </div>
        </div>

        {/* Report Content */}
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
            <Image
              src={report.url}
              alt="Report Image"
              width={600}
              height={800}
              className="rounded-lg shadow-sm object-contain max-h-[500px] w-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function QrAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse w-32 h-8 rounded bg-muted" />
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
