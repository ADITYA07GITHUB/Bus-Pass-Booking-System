// app/api/admin/analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BusPass } from "@/models/BusPass";
import { User } from "@/models/User";
import { getAuthFromRequest, isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    // Run all queries in parallel for performance
    const [
      totalUsers,
      passStatusCounts,
      revenueAgg,
      passesByTypeAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),

      // Pass counts by status
      BusPass.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Revenue by month (only approved passes)
      BusPass.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$fare" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),

      // Passes by type
      BusPass.aggregate([
        { $group: { _id: "$passType", count: { $sum: 1 } } },
      ]),
    ]);

    // Process status counts
    const statusMap = Object.fromEntries(
      passStatusCounts.map((s: { _id: string; count: number }) => [s._id, s.count])
    );
    const totalPasses = Object.values(statusMap).reduce((a, b) => (a as number) + (b as number), 0) as number;

    // Calculate total revenue
    const totalRevenue = revenueAgg.reduce(
      (sum: number, m: { revenue: number }) => sum + m.revenue, 0
    );

    // Format monthly revenue
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = revenueAgg.map((m: { _id: { year: number; month: number }; revenue: number }) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
    }));

    const passesByStatus = passStatusCounts.map((s: { _id: string; count: number }) => ({
      status: s._id,
      count: s.count,
    }));

    const passesByType = passesByTypeAgg.map((t: { _id: string; count: number }) => ({
      type: t._id,
      count: t.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalPasses,
        pendingPasses: statusMap["pending"] || 0,
        approvedPasses: statusMap["approved"] || 0,
        rejectedPasses: statusMap["rejected"] || 0,
        expiredPasses: statusMap["expired"] || 0,
        totalRevenue,
        revenueByMonth,
        passesByStatus,
        passesByType,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
