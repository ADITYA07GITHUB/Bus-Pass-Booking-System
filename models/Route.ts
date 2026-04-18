// models/Route.ts - Mongoose schema for Routes collection

import mongoose, { Document, Schema } from "mongoose";

export interface IRoute extends Document {
  source: string;
  destination: string;
  fare: number;
  distance?: number;
  duration?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    source: {
      type: String,
      required: [true, "Source location is required"],
      trim: true,
      minlength: [2, "Source must be at least 2 characters"],
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      minlength: [2, "Destination must be at least 2 characters"],
    },
    fare: {
      type: Number,
      required: [true, "Fare is required"],
      min: [1, "Fare must be at least ₹1"],
    },
    distance: {
      type: Number,
      min: [0.1, "Distance must be positive"],
    },
    duration: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Compound index to prevent duplicate routes
RouteSchema.index({ source: 1, destination: 1 }, { unique: true });
RouteSchema.index({ isActive: 1 });

export const Route = mongoose.models.Route || mongoose.model<IRoute>("Route", RouteSchema);
