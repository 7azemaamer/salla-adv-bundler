import mongoose from "mongoose";
import AdminUser from "../src/modules/admin/model/adminUser.model.js";
import connectDB from "../src/db/connectDB.js";
import bcrypt from "bcryptjs";

const testLogin = async () => {
  try {
    await connectDB();

    const email = "admin@admin.com";
    const password = "admin1234";

    console.log("\n🔍 Testing Admin Login\n");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);

    // Find admin
    const admin = await AdminUser.findOne({ email: email.toLowerCase() });

    if (!admin) {
      console.log("❌ Admin not found!");
      process.exit(1);
    }

    console.log("✅ Admin found!");
    console.log(`ID: ${admin._id}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Active: ${admin.is_active}`);
    console.log(`Hashed Password: ${admin.password}\n`);

    // Test password comparison
    console.log("Testing password comparison...");
    const isMatch = await admin.comparePassword(password);
    console.log(`Password match: ${isMatch ? "✅ YES" : "❌ NO"}\n`);

    // Manual bcrypt test
    console.log("Manual bcrypt test...");
    const manualMatch = await bcrypt.compare(password, admin.password);
    console.log(`Manual match: ${manualMatch ? "✅ YES" : "❌ NO"}\n`);

    if (isMatch) {
      console.log("🎉 Password verification successful!");
      console.log("The admin can login with these credentials.");
    } else {
      console.log("❌ Password verification failed!");
      console.log("There might be an issue with password hashing.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

testLogin();
