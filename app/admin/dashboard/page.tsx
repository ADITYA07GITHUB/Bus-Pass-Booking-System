"use client";
// app/admin/dashboard/page.tsx

import { useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useAppDispatch, useAdmin } from "@/hooks";
import { fetchAnalytics, fetchAllPasses } from "@/store/slices/adminSlice";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function StatCard({ icon: Icon, label, value, change, color }: {
  icon: React.ElementType; label: string; value: string | number; change?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change && <p className="text-xs text-emerald-600 font-medium mt-1">{change}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { analytics, allPasses, isLoading } = useAdmin();

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchAllPasses({ limit: 5, status: "pending" }));
  }, [dispatch]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of the bus pass system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard icon={Users} label="Total Users" value={analytics?.totalUsers ?? 0} color="bg-blue-100 text-blue-600" />
            <StatCard icon={CreditCard} label="Total Passes" value={analytics?.totalPasses ?? 0} color="bg-purple-100 text-purple-600" />
            <StatCard icon={Clock} label="Pending" value={analytics?.pendingPasses ?? 0} color="bg-amber-100 text-amber-600" />
            <StatCard
              icon={TrendingUp}
              label="Revenue"
              value={formatCurrency(analytics?.totalRevenue ?? 0)}
              color="bg-emerald-100 text-emerald-600"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.revenueByMonth && analytics.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.revenueByMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Pass Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pass Status</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.passesByStatus && analytics.passesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.passesByStatus}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="count" nameKey="status"
                    paddingAngle={3}
                  >
                    {analytics.passesByStatus.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span className="text-xs capitalize">{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Pending Applications</CardTitle>
          <Link href="/admin/passes?status=pending">
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Button>
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
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : allPasses.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up! No pending applications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {allPasses.slice(0, 5).map((pass) => {
                const user = typeof pass.userId === "object" ? pass.userId : null;
                const route = typeof pass.routeId === "object" ? pass.routeId : null;
                return (
                  <div key={pass._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {(user as { name?: string })?.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{(user as { name?: string })?.name ?? "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {route ? `${route.source} → ${route.destination}` : "N/A"} • {formatDate(pass.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/passes/${pass._id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
