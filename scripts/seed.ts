// scripts/seed.ts
// Run this ONCE to create the initial admin user in your MongoDB database.
// Usage: bun run scripts/seed.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Minimal User schema for seeding
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    phone: String,
    address: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected\n");

  const usersToSeed = [
    {
      name: "Admin User",
      email: "admin@cloudbuspass.com",   // ← Change this to your real admin email
      password: "Admin@1234",            // ← Change this to a strong password
      role: "admin",
      phone: "9999999999",
      isActive: true,
    },
    {
      name: "Test User",
      email: "user@cloudbuspass.com",    // ← Change this to a real test email
      password: "User@1234",             // ← Change this to a strong password
      role: "user",
      phone: "8888888888",
      isActive: true,
    },
  ];

  for (const userData of usersToSeed) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⚠️  User already exists: ${userData.email} — skipping`);
      continue;
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    await User.create({ ...userData, password: hashedPassword });
    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("You can now log in with the credentials above.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
