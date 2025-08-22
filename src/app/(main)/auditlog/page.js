"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Image from "next/image";
import { format } from "date-fns";
import Loader from "@/components/ui/Loader";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // ShadCN button

const ITEMS_PER_PAGE = 50;

const AuditLogPage = () => {
  const { user, isLoading: userLoading } = useUser();
  const {
    data,
    error,
    isLoading,
  } = useFetch({
    url: "/api/auditlog",
    method: "GET",
    auto: true,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch audit logs");
    },
  });


  const [page, setPage] = useState(1);

  if (userLoading || isLoading) return <Loader />;
  if (error) return <div className="text-destructive text-center py-10">{error}</div>;

  const allLogs = (data?.logs || []).filter(log => log.user?._id === user._id);
  const totalPages = Math.ceil(allLogs.length / ITEMS_PER_PAGE);

  const paginatedLogs = allLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="w-full mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Audit Log</h2>
      <Table className="w-full border rounded-lg shadow">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="text-right">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">No audit logs found.</TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map(log => (
              <TableRow key={log._id}>
                <TableCell className="flex items-center gap-2">
                  <Image
                    src={log.user?.avatar || "/window.svg"}
                    alt={log.user?.name || "User"}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full border object-cover"
                  />
                  <span>{log.user?.name || '-'}</span>
                </TableCell>
                <TableCell>{log.user?.email || '-'}</TableCell>
                <TableCell className="capitalize font-medium">{log.action}</TableCell>
                <TableCell>{log.resourceName || '-'}</TableCell>
                <TableCell className='text-right'>{format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
