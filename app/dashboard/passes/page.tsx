"use client";
// app/dashboard/passes/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Search, Filter, AlertCircle } from "lucide-react";
import { useAppDispatch, usePasses } from "@/hooks";
import { fetchMyPasses } from "@/store/slices/passSlice";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BusPass } from "@/types";

function PassCard({ pass }: { pass: BusPass }) {
  const route = typeof pass.routeId === "object" ? pass.routeId : null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {route ? `${route.source} → ${route.destination}` : "Route N/A"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">{pass.passNumber}</p>
          </div>
        </div>
        <span className={`status-badge ${getStatusColor(pass.status)}`}>
          {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-accent/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-0.5">Type</p>
          <p className="text-sm font-semibold capitalize">{pass.passType}</p>
        </div>
        <div className="text-center p-2 bg-accent/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-0.5">Valid Till</p>
          <p className="text-sm font-semibold">{formatDate(pass.validTo)}</p>
        </div>
        <div className="text-center p-2 bg-accent/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-0.5">Fare</p>
          <p className="text-sm font-semibold">{formatCurrency(pass.fare)}</p>
        </div>
      </div>

      <Link href={`/dashboard/passes/${pass._id}`}>
        <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
          View Details
        </Button>
      </Link>
    </div>
  );
}

export default function MyPassesPage() {
  const dispatch = useAppDispatch();
  const { passes, isLoading, pagination } = usePasses();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyPasses({
      page,
      limit: 9,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }));
  }, [dispatch, page, statusFilter]);

  const filteredPasses = passes.filter((p) => {
    if (!search) return true;
    const route = typeof p.routeId === "object" ? p.routeId : null;
    const routeStr = route ? `${route.source} ${route.destination}` : "";
    return (
      p.passNumber.toLowerCase().includes(search.toLowerCase()) ||
      routeStr.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Bus Passes</h1>
        <p className="page-subtitle">Track and manage all your pass applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by route or pass number..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/dashboard/apply">
          <Button className="w-full sm:w-auto">+ Apply for Pass</Button>
        </Link>
      </div>

      {/* Pass Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredPasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No passes found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {search || statusFilter !== "all" ? "Try adjusting your filters" : "You haven't applied for any bus passes yet"}
            </p>
            <Link href="/dashboard/apply">
              <Button>Apply for a Pass</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPasses.map((pass) => (
              <PassCard key={pass._id} pass={pass} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
