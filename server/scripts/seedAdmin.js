import mongoose from "mongoose";
import AdminUser from "../src/modules/admin/model/adminUser.model.js";
import connectDB from "../src/db/connectDB.js";
import { config } from "../src/config/env.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("\n🌱 Admin User Seed Script\n");
    console.log("This script will create a new admin user in the database.\n");

    // Check if admin already exists
    const adminCount = await AdminUser.countDocuments({ roles: "admin" });

    if (adminCount > 0) {
      const overwrite = await question(
        `⚠️  Warning: ${adminCount} admin user(s) already exist. Continue anyway? (yes/no): `
      );

      if (
        overwrite.toLowerCase() !== "yes" &&
        overwrite.toLowerCase() !== "y"
      ) {
        console.log("\n❌ Seed cancelled.");
        rl.close();
        process.exit(0);
      }
    }

    // Collect admin details
    const name = await question("\nEnter admin name: ");
    const email = await question("Enter admin email: ");
    const password = await question(
      "Enter admin password (min 8 characters): "
    );
    const confirmPassword = await question("Confirm password: ");

    // Validation
    if (!name || !email || !password) {
      console.log("\n❌ Error: All fields are required.");
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.log("\n❌ Error: Passwords do not match.");
      rl.close();
      process.exit(1);
    }

    if (password.length < 8) {
      console.log("\n❌ Error: Password must be at least 8 characters long.");
      rl.close();
      process.exit(1);
    }

    // Check if email already exists
    const existingAdmin = await AdminUser.findOne({
      email: email.toLowerCase(),
    });
    if (existingAdmin) {
      console.log("\n❌ Error: An admin with this email already exists.");
      rl.close();
      process.exit(1);
    }

    // Create admin user
    const admin = new AdminUser({
      name,
      email: email.toLowerCase(),
      password,
      roles: ["admin"],
      is_active: true,
    });

    await admin.save();

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📋 Admin Details:");
    console.log(`   ID: ${admin._id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Roles: ${admin.roles.join(", ")}`);
    console.log(`   Created At: ${admin.createdAt}`);
    console.log(
      "\n🎉 You can now login to the admin dashboard with these credentials.\n"
    );

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding admin:", error.message);
    rl.close();
    process.exit(1);
  }
};

// Run the seed script
seedAdmin();
