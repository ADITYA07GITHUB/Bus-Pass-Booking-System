// app/api/admin/passes/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BusPass } from "@/models/BusPass";
import { getAuthFromRequest, isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const query = BusPass.find(filter)
      .populate("userId", "name email phone")
      .populate("routeId", "source destination fare")
      .sort({ createdAt: -1 });

    // Search by pass number (text search on populated fields requires aggregation;
    // here we filter in-memory after fetch for simplicity)
    const [allResults, total] = await Promise.all([
      query.skip((page - 1) * limit).limit(limit).lean(),
      BusPass.countDocuments(filter),
    ]);

    let filtered = allResults;
    if (search) {
      const s = search.toLowerCase();
      filtered = allResults.filter((p) => {
        const user = p.userId as { name?: string; email?: string };
        const route = p.routeId as { source?: string; destination?: string };
        return (
          p.passNumber.toLowerCase().includes(s) ||
          user?.name?.toLowerCase().includes(s) ||
          user?.email?.toLowerCase().includes(s) ||
          route?.source?.toLowerCase().includes(s) ||
          route?.destination?.toLowerCase().includes(s)
        );
      });
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin GET passes error:", error);
    return NextResponse.json({ error: "Failed to fetch passes" }, { status: 500 });
  }
}
