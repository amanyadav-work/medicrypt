"use client";

import { useUser } from "@/context/UserContext";
import useFetch from "@/hooks/useFetch";
import Loader from "@/components/ui/Loader";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Image as LucideImage, Search, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserReportsPage() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByViews, setSortByViews] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (userLoading || isLoading) return <Loader />;
  if (error) return <div className="text-destructive text-center py-10">{error}</div>;

  const reports = data?.reports || [];

  let filteredReports = reports
    .filter(r => filter === "all" || r.type === filter)
    .filter(r => {
      const title = r.title || r.url?.split("/").pop() || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

  if (sortByViews) {
    filteredReports = [...filteredReports].sort((a, b) => b.views - a.views);
  }

  return (
    <>
      <div>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center px-5 border-b-2 py-5 gap-4'>
          <h1 className="text-2xl font-bold 
            bg-gradient-to-r 
            from-green-500 via-emerald-500 to-teal-500 
            dark:from-lime-400 dark:via-green-400 dark:to-emerald-300 
            bg-clip-text text-transparent drop-shadow-sm">
            Your Reports
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports"
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <Button variant="outline" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full sm:w-auto flex items-center justify-between gap-2">
                Filter Type <ChevronDown className="h-4 w-4" />
              </Button>

              {dropdownOpen && (
                <div className="absolute z-50 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5">
                  <div className="py-1 text-sm">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                        filter === 'all' ? 'font-semibold text-green-500' : ''
                      }`}
                    >
                      {filter === "all" && "✅ "} All
                    </button>
                    <button
                      onClick={() => {
                        setFilter("pdf");
                        setDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                        filter === 'pdf' ? 'font-semibold text-green-500' : ''
                      }`}
                    >
                      {filter === "pdf" && "✅ "} PDF
                    </button>
                    <button
                      onClick={() => {
                        setFilter("image");
                        setDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                        filter === 'image' ? 'font-semibold text-green-500' : ''
                      }`}
                    >
                      {filter === "image" && "✅ "} Images
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort by Views Button (Separate) */}
            <Button
              variant={sortByViews ? "default" : "outline"}
              onClick={() => setSortByViews(prev => !prev)}
            >
              Sort by Views
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full min-h-[200px] px-5 py-8">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No reports found.
          </div>
        ) : (
          filteredReports.map(report => (
            <Link key={report._id} href={`/reports/${report._id}`} className="focus:outline-none">
              <Card className="flex flex-col items-center p-6 gap-4 shadow-md border border-border bg-card hover:shadow-xl transition cursor-pointer group">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary mb-2">
                  {report.type === "pdf" ? (
                    <FileText size={36} className="text-primary transition" />
                  ) : (
                    <LucideImage size={36} className="text-primary transition" />
                  )}
                </div>
                <div className="w-full text-center">
                  <div className="font-bold text-xl text-primary mb-1 truncate">
                    {report.title || report.url.split("/").pop()}
                  </div>
                  {report.description && (
                    <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {report.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">Type: {report.type}</div>
                  <div className="text-xs text-muted-foreground">
                    Created: {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">Views: {report.views}</div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
