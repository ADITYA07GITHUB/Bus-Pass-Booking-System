// scripts/seed.ts - Seed the database with demo data
// Run with: npx ts-node scripts/seed.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb+srv://adityadhokchaule1_db_user:pwdiJhVuFAw7er1l@cluster0.hmekyl3.mongodb.net/?appName=Cluster0"

// Inline schemas for seeding
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const RouteSchema = new mongoose.Schema({
  source: String,
  destination: String,
  fare: Number,
  distance: Number,
  duration: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.model("User", UserSchema);
    const Route = mongoose.model("Route", RouteSchema);

    // Clear existing data
    await User.deleteMany({});
    await Route.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create admin
    const adminPassword = await bcrypt.hash("admin123", 12);
    await User.create({
      name: "System Admin",
      email: "admin@demo.com",
      password: adminPassword,
      role: "admin",
      phone: "9000000001",
      address: "Admin Office, Pune",
      isActive: true,
    });
    console.log("👤 Admin created: admin@demo.com / admin123");

    // Create demo user
    const userPassword = await bcrypt.hash("user1234", 12);
    await User.create({
      name: "Demo User",
      email: "user@demo.com",
      password: userPassword,
      role: "user",
      phone: "9876543210",
      address: "123 Main Street, Pune",
      isActive: true,
    });
    console.log("👤 User created: user@demo.com / user1234");

    // Create sample routes
    const routes = [
      { source: "Pune Station", destination: "Hinjewadi IT Park", fare: 45, distance: 22, duration: "50 mins" },
      { source: "Swargate", destination: "Kothrud Depot", fare: 20, distance: 8, duration: "25 mins" },
      { source: "Shivajinagar", destination: "Wakad", fare: 35, distance: 15, duration: "40 mins" },
      { source: "Deccan Gymkhana", destination: "Baner", fare: 25, distance: 10, duration: "30 mins" },
      { source: "Katraj", destination: "Hadapsar", fare: 30, distance: 14, duration: "35 mins" },
      { source: "Pimpri", destination: "Kharadi", fare: 50, distance: 25, duration: "60 mins" },
      { source: "Viman Nagar", destination: "Magarpatta", fare: 18, distance: 6, duration: "20 mins" },
      { source: "Nigdi", destination: "Camp", fare: 55, distance: 28, duration: "65 mins" },
    ];

    await Route.insertMany(routes);
    console.log(`🚌 Created ${routes.length} bus routes`);

    console.log("\n✨ Seeding complete!");
    console.log("\nDemo credentials:");
    console.log("  Admin → admin@demo.com / admin123");
    console.log("  User  → user@demo.com / user1234");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

seed();
