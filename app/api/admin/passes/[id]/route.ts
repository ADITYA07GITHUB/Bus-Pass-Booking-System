// app/api/admin/passes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BusPass } from "@/models/BusPass";
import { getAuthFromRequest, isAdmin } from "@/lib/auth";
import QRCode from "qrcode";

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

    const { status, rejectionReason } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be approved or rejected" }, { status: 400 });
    }

    const pass = await BusPass.findById(id);
    if (!pass) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

    if (pass.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending passes can be reviewed" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      approvedAt: new Date(),
      approvedBy: auth.userId,
    };

    if (status === "rejected") {
      if (!rejectionReason?.trim()) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
      }
      updateData.rejectionReason = rejectionReason.trim();
    }

    // Generate QR code on approval
    if (status === "approved") {
      const qrData = JSON.stringify({
        passNumber: pass.passNumber,
        passId: pass._id.toString(),
        userId: pass.userId.toString(),
        validFrom: pass.validFrom,
        validTo: pass.validTo,
        passType: pass.passType,
      });
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
      updateData.qrCode = qrCode;
    }

    const updatedPass = await BusPass.findByIdAndUpdate(id, updateData, { new: true })
      .populate("userId", "name email")
      .populate("routeId", "source destination fare");

    return NextResponse.json({
      success: true,
      message: `Pass ${status} successfully`,
      data: updatedPass,
    });
  } catch (error) {
    console.error("Admin PUT pass error:", error);
    return NextResponse.json({ error: "Failed to update pass" }, { status: 500 });
  }
}

export async function GET(
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

    const pass = await BusPass.findById(id)
      .populate("userId", "name email phone address")
      .populate("routeId", "source destination fare distance duration");

    if (!pass) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: pass });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pass" }, { status: 500 });
  }
}
