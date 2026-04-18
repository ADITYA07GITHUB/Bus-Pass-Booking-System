// app/api/passes/[id]/renew/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BusPass } from "@/models/BusPass";
import { Route } from "@/models/Route";
import { getAuthFromRequest } from "@/lib/auth";
import { calculateValidityDate, getFareMultiplier, generatePassNumber } from "@/lib/utils";
import QRCode from "qrcode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    // Find original pass
    const originalPass = await BusPass.findById(id).populate("routeId");
    if (!originalPass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    // Ensure it belongs to the requesting user
    if (originalPass.userId.toString() !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can only renew approved or expired passes
    if (!["approved", "expired"].includes(originalPass.status)) {
      return NextResponse.json(
        { error: "Only approved or expired passes can be renewed" },
        { status: 400 }
      );
    }

    const route = originalPass.routeId as InstanceType<typeof Route>;
    const fare = route.fare * getFareMultiplier(originalPass.passType);
    const validFrom = new Date();
    const validTo = calculateValidityDate(validFrom, originalPass.passType);
    const passNumber = generatePassNumber();

    // Create renewal pass (new pending application)
    const newPass = await BusPass.create({
      userId: auth.userId,
      routeId: originalPass.routeId,
      passType: originalPass.passType,
      validFrom,
      validTo,
      fare,
      passNumber,
      status: "pending",
    });

    const populated = await BusPass.findById(newPass._id)
      .populate("routeId", "source destination fare")
      .populate("userId", "name email");

    return NextResponse.json(
      { success: true, message: "Renewal application submitted", data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error("Renew pass error:", error);
    return NextResponse.json({ error: "Failed to renew pass" }, { status: 500 });
  }
}
