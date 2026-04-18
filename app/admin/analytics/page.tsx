"use client";
// app/admin/analytics/page.tsx

import { useEffect } from "react";
import { TrendingUp, Users, CreditCard, IndianRupee, BarChart3 } from "lucide-react";
import { useAppDispatch, useAdmin } from "@/hooks";
import { fetchAnalytics } from "@/store/slices/adminSlice";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  expired: "#94a3b8",
};
const TYPE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4"];

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { analytics, isLoading } = useAdmin();

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: "Total Users", value: analytics?.totalUsers ?? 0, color: "bg-blue-100 text-blue-600", change: null },
    { icon: CreditCard, label: "Total Passes", value: analytics?.totalPasses ?? 0, color: "bg-purple-100 text-purple-600", change: null },
    { icon: TrendingUp, label: "Approved Passes", value: analytics?.approvedPasses ?? 0, color: "bg-emerald-100 text-emerald-600", change: null },
    { icon: IndianRupee, label: "Total Revenue", value: formatCurrency(analytics?.totalRevenue ?? 0), color: "bg-amber-100 text-amber-600", change: null },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">System-wide statistics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", value: analytics?.pendingPasses ?? 0, color: "text-amber-600" },
          { label: "Rejected", value: analytics?.rejectedPasses ?? 0, color: "text-red-600" },
          { label: "Expired", value: analytics?.expiredPasses ?? 0, color: "text-slate-600" },
          { label: "Active", value: analytics?.approvedPasses ?? 0, color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label} Passes</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.revenueByMonth?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.revenueByMonth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No revenue data available</div>
            )}
          </CardContent>
        </Card>

        {/* Pass Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pass Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.passesByStatus?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={analytics.passesByStatus}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    dataKey="count" nameKey="status"
                    paddingAngle={3}
                  >
                    {analytics.passesByStatus.map((entry, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(v) => <span className="text-xs capitalize">{v}</span>}
                  />
                  <Tooltip
                    formatter={(v, name) => [v, name]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No status data available</div>
            )}
          </CardContent>
        </Card>

        {/* Pass Types Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Passes by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.passesByType?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.passesByType} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.passesByType.map((_, idx) => (
                      <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No type data available</div>
            )}
          </CardContent>
        </Card>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.revenueByMonth?.slice(-6).map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16">{item.month}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (item.revenue / (Math.max(...(analytics?.revenueByMonth?.map(m => m.revenue) ?? [1])))) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
              {!analytics?.revenueByMonth?.length && (
                <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
