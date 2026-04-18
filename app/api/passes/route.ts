// app/api/passes/route.ts - GET (list user's passes) + POST (apply for pass)

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BusPass } from "@/models/BusPass";
import { Route } from "@/models/Route";
import { getAuthFromRequest } from "@/lib/auth";
import { calculateValidityDate, getFareMultiplier, generatePassNumber } from "@/lib/utils";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { userId: auth.userId };
    if (status) filter.status = status;

    const [passes, total] = await Promise.all([
      BusPass.find(filter)
        .populate("routeId", "source destination fare")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BusPass.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: passes,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET passes error:", error);
    return NextResponse.json({ error: "Failed to fetch passes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { routeId, passType } = await req.json();

    if (!routeId || !passType) {
      return NextResponse.json({ error: "Route and pass type are required" }, { status: 400 });
    }

    // Validate route exists
    const route = await Route.findById(routeId);
    if (!route || !route.isActive) {
      return NextResponse.json({ error: "Selected route is not available" }, { status: 400 });
    }

    // Check for existing active/pending pass on same route
    const existing = await BusPass.findOne({
      userId: auth.userId,
      routeId,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have an active or pending pass for this route" },
        { status: 409 }
      );
    }

    // Calculate fare and validity
    const fare = route.fare * getFareMultiplier(passType);
    const validFrom = new Date();
    const validTo = calculateValidityDate(validFrom, passType);
    const passNumber = generatePassNumber();

    // Create pass
    const pass = await BusPass.create({
      userId: auth.userId,
      routeId,
      passType,
      validFrom,
      validTo,
      fare,
      passNumber,
      status: "pending",
    });

    const populated = await BusPass.findById(pass._id)
      .populate("routeId", "source destination fare")
      .populate("userId", "name email");

    return NextResponse.json(
      { success: true, message: "Pass application submitted", data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST pass error:", error);
    return NextResponse.json({ error: "Failed to apply for pass" }, { status: 500 });
  }
}
