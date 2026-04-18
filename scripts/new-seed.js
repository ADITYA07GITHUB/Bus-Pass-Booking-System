// scripts/seed.ts
// Run with: npx ts-node scripts/seed.ts

import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🚀 Generating seed data...\n");

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 12);
    const userPassword = await bcrypt.hash("user1234", 12);

    // Users
    const users = [
      {
        name: "System Admin",
        email: "admin@demo.com",
        password: adminPassword,
        role: "admin",
        phone: "9000000001",
        address: "Admin Office, Pune",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Demo User",
        email: "user@demo.com",
        password: userPassword,
        role: "user",
        phone: "9876543210",
        address: "123 Main Street, Pune",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Routes
    const routes = [
      { source: "Pune Station", destination: "Hinjewadi IT Park", fare: 45, distance: 22, duration: "50 mins", isActive: true },
      { source: "Swargate", destination: "Kothrud Depot", fare: 20, distance: 8, duration: "25 mins", isActive: true },
      { source: "Shivajinagar", destination: "Wakad", fare: 35, distance: 15, duration: "40 mins", isActive: true },
      { source: "Deccan Gymkhana", destination: "Baner", fare: 25, distance: 10, duration: "30 mins", isActive: true },
      { source: "Katraj", destination: "Hadapsar", fare: 30, distance: 14, duration: "35 mins", isActive: true },
      { source: "Pimpri", destination: "Kharadi", fare: 50, distance: 25, duration: "60 mins", isActive: true },
      { source: "Viman Nagar", destination: "Magarpatta", fare: 18, distance: 6, duration: "20 mins", isActive: true },
      { source: "Nigdi", destination: "Camp", fare: 55, distance: 28, duration: "65 mins", isActive: true },
    ].map(r => ({
      ...r,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Print nicely formatted JSON
    console.log("📦 USERS (insert into 'users' collection):");
    console.log(JSON.stringify(users, null, 2));

    console.log("\n🚌 ROUTES (insert into 'routes' collection):");
    console.log(JSON.stringify(routes, null, 2));

    console.log("\n✨ Done!");
    console.log("\nDemo credentials:");
    console.log("Admin → admin@demo.com / admin123");
    console.log("User  → user@demo.com / user1234");

  } catch (error) {
    console.error("❌ Error generating seed data:", error);
  }
}

seed();