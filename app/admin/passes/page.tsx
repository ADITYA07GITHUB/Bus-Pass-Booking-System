"use client";
// app/admin/passes/page.tsx

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAppDispatch, useAdmin } from "@/hooks";
import { fetchAllPasses, updatePassStatus } from "@/store/slices/adminSlice";
import { formatDate, formatCurrency, getStatusColor, debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { BusPass } from "@/types";

function PassRow({ pass, onApprove, onReject }: {
  pass: BusPass;
  onApprove: (id: string) => void;
  onReject: (pass: BusPass) => void;
}) {
  const user = typeof pass.userId === "object" ? pass.userId : null;
  const route = typeof pass.routeId === "object" ? pass.routeId : null;

  return (
    <tr className="table-row-hover border-b border-border">
      <td className="p-4">
        <div>
          <p className="font-medium text-sm">{(user as { name?: string })?.name ?? "N/A"}</p>
          <p className="text-xs text-muted-foreground">{(user as { email?: string })?.email ?? ""}</p>
        </div>
      </td>
      <td className="p-4 text-sm">
        {route ? `${route.source} → ${route.destination}` : "N/A"}
      </td>
      <td className="p-4">
        <span className="text-sm font-medium capitalize">{pass.passType}</span>
      </td>
      <td className="p-4 text-sm">{formatCurrency(pass.fare)}</td>
      <td className="p-4 text-sm text-muted-foreground">{formatDate(pass.createdAt)}</td>
      <td className="p-4">
        <span className={`status-badge ${getStatusColor(pass.status)}`}>
          {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Link href={`/admin/passes/${pass._id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {pass.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                title="Approve"
                onClick={() => onApprove(pass._id)}
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject"
                onClick={() => onReject(pass)}
              >
                <XCircle className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminPassesPage() {
  const dispatch = useAppDispatch();
  const { allPasses, isLoading, pagination } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rejectPass, setRejectPass] = useState<BusPass | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadPasses = useCallback(() => {
    dispatch(fetchAllPasses({
      page,
      limit: 10,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: search || undefined,
    }));
  }, [dispatch, page, statusFilter, search]);

  useEffect(() => { loadPasses(); }, [loadPasses]);

  const handleApprove = async (passId: string) => {
    setActionLoading(true);
    try {
      await dispatch(updatePassStatus({ passId, status: "approved" })).unwrap();
      toast({ title: "Pass Approved", description: "The pass has been approved and QR code generated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: String(err) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectPass) return;
    setActionLoading(true);
    try {
      await dispatch(updatePassStatus({ passId: rejectPass._id, status: "rejected", rejectionReason })).unwrap();
      toast({ title: "Pass Rejected", description: "The application has been rejected." });
      setRejectPass(null);
      setRejectionReason("");
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: String(err) });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pass Applications</h1>
        <p className="page-subtitle">Review, approve, or reject bus pass applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Route</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Fare</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Applied</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-border">
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : allPasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  allPasses.map((pass) => (
                    <PassRow
                      key={pass._id}
                      pass={pass}
                      onApprove={handleApprove}
                      onReject={setRejectPass}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!rejectPass} onOpenChange={(o) => !o && setRejectPass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this application. The applicant will be notified.
            </p>
            <Textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectPass(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
