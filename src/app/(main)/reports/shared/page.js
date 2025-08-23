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
    onSuccess: (data) => {
      console.log("Shared reports fetched successfully", data);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to fetch shared reports");
    }
  });

  if (userLoading || isLoading) return <Loader />;
  if (error) return <div className="text-destructive text-center py-10">{error}</div>;

  const sharedReports = data?.sharedReports || [];

  return (
    <>
      <div className='flex justify-between px-5 border-b-2 py-5'>
        <h1 className="text-2xl font-bold 
        bg-gradient-to-r 
        from-green-500 via-emerald-500 to-teal-500 
        dark:from-lime-400 dark:via-green-400 dark:to-emerald-300 
        bg-clip-text text-transparent drop-shadow-sm">
          Reports Shared With You
        </h1>
      </div>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 pt-5">
          {sharedReports.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">No shared reports found.</div>
          ) : (
            sharedReports.map(item => {
              const report = item.report || {};
              const title = report.title || item.title || 'Untitled';
              const description = report.description || item.description || '';
              const type = report.type || item.type;
              return (
                <Link key={item._id} href={`/reports/${report._id || item?.report?._id}`} className="focus:outline-none">
                  <Card className="flex flex-col items-center p-6 gap-4 shadow-md border border-border bg-card hover:shadow-xl transition cursor-pointer group">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary mb-2">
                      {type === "pdf" ? (
                        <FileText size={36} className="text-primary group-hover:text-primary-foreground transition" />
                      ) : (
                        <LucideImage size={36} className="text-primary group-hover:text-primary-foreground transition" />
                      )}
                    </div>
                    <div className="w-full text-center">
                      <div className="font-bold text-xl text-primary mb-1 truncate">{title}</div>
                      {description && (
                        <div className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</div>
                      )}
                      <div className="text-xs text-muted-foreground">Type: {type}</div>
                      <div className="text-xs text-muted-foreground">Shared: {format(new Date(item.createdAt), "MMM d, yyyy")}</div>
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
    </>
  );
};

export default SharedReportsPage;
