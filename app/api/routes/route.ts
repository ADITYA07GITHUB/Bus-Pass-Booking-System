// app/api/routes/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { getAuthFromRequest, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const routes = await Route.find({}).sort({ source: 1 }).lean();
    return NextResponse.json({ success: true, data: routes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { source, destination, fare, distance, duration } = body;

    if (!source || !destination || !fare) {
      return NextResponse.json({ error: "Source, destination, and fare are required" }, { status: 400 });
    }

    const route = await Route.create({ source, destination, fare, distance, duration });
    return NextResponse.json({ success: true, data: route }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return NextResponse.json({ error: "This route already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Failed to create route" }, { status: 500 });
  }
}
