"use client";


import useFetch from "@/hooks/useFetch";
import { useUser } from "@/context/UserContext";
import Loader from "@/components/ui/Loader";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Image as LucideImage } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const SharedReportsPage = () => {
  const { user, isLoading: userLoading } = useUser();
  const {
    data,
    error,
    isLoading,
    refetch
  } = useFetch({
    url: "/api/sharedreports",
    method: "GET",
    auto: true,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch shared reports");
    }
  });

  if (userLoading || isLoading) return <Loader fullScreen />;
  if (error) return <div className="text-destructive text-center py-10">{error}</div>;

  const sharedReports = data?.sharedReports || [];

  return (
    <div className="mx-auto py-10 px-2 sm:px-4 md:px-8 lg:px-16 max-w-5xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">Reports Shared With You</h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sharedReports.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">No shared reports found.</div>
        ) : (
          sharedReports.map(item => (
            <Link key={item._id} href={`/reports/${item.report?._id}`} className="focus:outline-none">
              <Card className="flex flex-col items-center p-6 gap-4 shadow-md border border-border bg-card hover:shadow-xl transition cursor-pointer group">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary mb-2">
                  {item.report?.type === "pdf" ? (
                    <FileText size={36} className="text-primary group-hover:text-primary-foreground transition" />
                  ) : (
                    <LucideImage size={36} className="text-primary group-hover:text-primary-foreground transition" />
                  )}
                </div>
                <div className="w-full text-center">
                  <div className="font-bold text-xl text-primary mb-1 truncate">{item.report?.title || item.report?.url?.split("/").pop()}</div>
                  {item.report?.description && (
                    <div className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.report.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground">Type: {item.report?.type}</div>
                  <div className="text-xs text-muted-foreground">Owner: {item.report?.owner?.name}</div>
                  <div className="text-xs text-muted-foreground">Shared: {format(new Date(item.createdAt), "MMM d, yyyy")}</div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SharedReportsPage;
