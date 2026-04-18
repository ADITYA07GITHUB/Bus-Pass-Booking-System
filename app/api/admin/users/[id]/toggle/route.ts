// app/api/admin/users/[id]/toggle/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
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

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot modify admin accounts" }, { status: 403 });
    }

    user.isActive = !user.isActive;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "suspended"}`,
      data: user.toJSON(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
