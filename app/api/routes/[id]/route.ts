// app/api/routes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { getAuthFromRequest, isAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const route = await Route.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: route });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message || "Failed to update route" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const route = await Route.findByIdAndDelete(id);
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Route deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}
