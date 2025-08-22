"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Image from "next/image";
import { format } from "date-fns";
import Loader from "@/components/ui/Loader";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";

const AuditLogPage = () => {
  const { user, isLoading: userLoading } = useUser();
  const {
    data,
    error,
    isLoading,
    refetch
  } = useFetch({
    url: "/api/auditlog",
    method: "GET",
    auto: true,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch audit logs");
    }
  });

  if (userLoading || isLoading) return <Loader fullScreen />;
  if (error) return <div className="text-destructive text-center py-10">{error}</div>;

  const logs = (data?.logs || []).filter(log => log.user?._id === user._id);

  return (
    <div className="w-full mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Audit Log</h2>
      <Table className="w-full border rounded-lg shadow">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className='text-right'>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">No audit logs found.</TableCell>
            </TableRow>
          ) : (
            logs.map(log => (
              <TableRow key={log._id}>
                <TableCell className="flex items-center gap-2">
                  <Image src={log.user?.avatar || "/window.svg"} alt={log.user?.name || "User"} width={32} height={32} className="rounded-full border object-cover"
                    style={{ borderRadius: '50%', objectFit: 'cover', width: 36, height: 36 }} />
                  <span>{log.user?.name}</span>
                </TableCell>
                <TableCell>{log.user?.email}</TableCell>
                <TableCell className="capitalize font-medium">{log.action}</TableCell>
                <TableCell className='text-right'>{format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditLogPage;
