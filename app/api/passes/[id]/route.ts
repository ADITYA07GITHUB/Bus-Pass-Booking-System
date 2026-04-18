// app/api/passes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BusPass } from "@/models/BusPass";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const pass = await BusPass.findById(id)
      .populate("routeId", "source destination fare distance duration")
      .populate("userId", "name email phone");

    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    // Users can only see their own passes; admins can see all
    if (auth.role !== "admin" && pass.userId._id.toString() !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: pass });
  } catch (error) {
    console.error("GET pass by ID error:", error);
    return NextResponse.json({ error: "Failed to fetch pass" }, { status: 500 });
  }
}
