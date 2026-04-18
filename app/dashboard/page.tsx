"use client";
// app/dashboard/page.tsx

import { useEffect } from "react";
import Link from "next/link";
import { CreditCard, PlusCircle, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useAuth, useAppDispatch, usePasses } from "@/hooks";
import { fetchMyPasses } from "@/store/slices/passSlice";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BusPass } from "@/types";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PassRow({ pass }: { pass: BusPass }) {
  const route = typeof pass.routeId === "object" ? pass.routeId : null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">
            {route ? `${route.source} → ${route.destination}` : "Route N/A"}
          </p>
          <p className="text-xs text-muted-foreground">
            {pass.passNumber} • Valid till {formatDate(pass.validTo)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`status-badge ${getStatusColor(pass.status)}`}>
          {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
        </span>
        <Link href={`/dashboard/passes/${pass._id}`}>
          <Button variant="ghost" size="sm" className="text-xs">View</Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { passes, isLoading } = usePasses();

  useEffect(() => {
    dispatch(fetchMyPasses({ limit: 5 }));
  }, [dispatch]);

  const stats = {
    total: passes.length,
    active: passes.filter((p) => p.status === "approved").length,
    pending: passes.filter((p) => p.status === "pending").length,
    rejected: passes.filter((p) => p.status === "rejected").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.name.split(" ")[0]} 👋</h1>
        <p className="page-subtitle">Here&apos;s an overview of your bus passes</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Link href="/dashboard/apply">
          <div className="group flex items-center gap-3 p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">
            <PlusCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold text-sm">Apply for Pass</p>
              <p className="text-xs text-blue-200">New bus pass application</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/renew">
          <div className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors cursor-pointer">
            <RotateCcw className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">Renew Pass</p>
              <p className="text-xs text-muted-foreground">Extend your validity</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/passes">
          <div className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors cursor-pointer">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">View All Passes</p>
              <p className="text-xs text-muted-foreground">Manage your passes</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CreditCard} label="Total Passes" value={stats.total} color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle} label="Active Passes" value={stats.active} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-amber-100 text-amber-600" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-100 text-red-600" />
      </div>

      {/* Recent Passes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
          <Link href="/dashboard/passes">
            <Button variant="ghost" size="sm" className="text-xs text-primary">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : passes.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No bus passes yet</p>
              <Link href="/dashboard/apply">
                <Button size="sm">Apply for your first pass</Button>
              </Link>
            </div>
          ) : (
            <div>
              {passes.slice(0, 5).map((pass) => (
                <PassRow key={pass._id} pass={pass} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
