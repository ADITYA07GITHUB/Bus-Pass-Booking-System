// models/BusPass.ts - Mongoose schema for BusPass collection

import mongoose, { Document, Schema } from "mongoose";

export interface IBusPass extends Document {
  userId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  passType: "monthly" | "quarterly" | "annual";
  validFrom: Date;
  validTo: Date;
  status: "pending" | "approved" | "rejected" | "expired";
  qrCode?: string;
  passNumber: string;
  fare: number;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusPassSchema = new Schema<IBusPass>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    routeId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route ID is required"],
    },
    passType: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      required: [true, "Pass type is required"],
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validTo: {
      type: Date,
      required: [true, "Valid to date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
    },
    qrCode: {
      type: String, // Base64 encoded QR code image
    },
    passNumber: {
      type: String,
      required: true,
      unique: true,
    },
    fare: {
      type: Number,
      required: [true, "Fare is required"],
      min: [0, "Fare cannot be negative"],
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_doc, ret: any) => {
        ret._id = ret._id.toString();
        if (ret.userId && typeof ret.userId === "object") {
          ret.userId._id = ret.userId._id?.toString();
        }
        if (ret.routeId && typeof ret.routeId === "object") {
          ret.routeId._id = ret.routeId._id?.toString();
        }
        return ret;
      },
    },
  }
);

// Indexes for common queries (passNumber already indexed via unique: true)
BusPassSchema.index({ userId: 1, status: 1 });
BusPassSchema.index({ status: 1 });
BusPassSchema.index({ validTo: 1 });

export const BusPass =
  mongoose.models.BusPass || mongoose.model<IBusPass>("BusPass", BusPassSchema);
