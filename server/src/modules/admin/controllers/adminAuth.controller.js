import AdminUser from "../model/adminUser.model.js";

/**
 * Admin login
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await AdminUser.updateOne(
      { _id: admin._id },
      { last_login_at: new Date() }
    );

    // Generate JWT token
    const token = admin.generateToken();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      data: {
        admin: adminData,
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Seed initial admin user (for development/setup)
 */
export const seedAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin user already exists",
      });
    }

    // Create new admin
    const admin = new AdminUser({
      email: email.toLowerCase(),
      password,
      name,
      roles: ["admin"],
      is_active: true,
    });

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: adminData,
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin user",
      error: error.message,
    });
  }
};
