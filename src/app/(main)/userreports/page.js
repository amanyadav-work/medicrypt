"use client";

import { useUser } from "@/context/UserContext";
import useFetch from "@/hooks/useFetch";
import Loader from "@/components/ui/Loader";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Image as LucideImage } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";


import { useState } from "react";
import { Button } from "@/components/ui/button";

// Lucide icons used for PDF and Image

const UserReportsPage = () => {
  const { user, isLoading: userLoading } = useUser();
  const {
    data,
    error,
    isLoading,
    refetch
  } = useFetch({
    url: "/api/reports/user",
    method: "GET",
    auto: true,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch your reports");
    }
  });

  const [filter, setFilter] = useState("all");

  if (userLoading || isLoading) return <Loader fullScreen />;
  if (error) return <div className="text-destructive text-center py-10">{error}</div>;

  const reports = data?.reports || [];
  const filteredReports = filter === "all"
    ? reports
    : reports.filter(r => r.type === filter);

  return (
    <div className="mx-auto py-10 px-2 sm:px-4 md:px-8 lg:px-16 max-w-5xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">Your Reports</h2>
      <div className="flex justify-center gap-4 mb-8">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        <Button variant={filter === "pdf" ? "default" : "outline"} onClick={() => setFilter("pdf")}>PDFs</Button>
        <Button variant={filter === "image" ? "default" : "outline"} onClick={() => setFilter("image")}>Images</Button>
      </div>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">No reports found.</div>
        ) : (
          filteredReports.map(report => (
            <Link key={report._id} href={`/reports/${report._id}`} className="focus:outline-none">
              <Card className="flex flex-col items-center p-6 gap-4 shadow-md border border-border bg-card hover:shadow-xl transition cursor-pointer group">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary mb-2">
                  {report.type === "pdf" ? (
                    <FileText size={36} className="text-primary group-hover:text-primary-foreground transition" />
                  ) : (
                    <LucideImage size={36} className="text-primary group-hover:text-primary-foreground transition" />
                  )}
                </div>
                <div className="w-full text-center">
                  <div className="font-bold text-xl text-primary mb-1 truncate">{report.title || report.url.split("/").pop()}</div>
                  {report.description && (
                    <div className="text-sm text-muted-foreground mb-2 line-clamp-2">{report.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground">Type: {report.type}</div>
                  <div className="text-xs text-muted-foreground">Created: {format(new Date(report.createdAt), "MMM d, yyyy")}</div>
                  <div className="text-xs text-muted-foreground">Views: {report.views}</div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default UserReportsPage;
