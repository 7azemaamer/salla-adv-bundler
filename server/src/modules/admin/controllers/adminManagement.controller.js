import AdminUser from "../model/adminUser.model.js";

/**
 * Get admin statistics
 */
export const getAdminStats = async (req, res) => {
  try {
    const total = await AdminUser.countDocuments();
    const active = await AdminUser.countDocuments({ is_active: true });
    const inactive = await AdminUser.countDocuments({ is_active: false });

    const byRole = await AdminUser.aggregate([
      {
        $unwind: "$roles",
      },
      {
        $group: {
          _id: "$roles",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        by_role: byRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};

/**
 * List all admins with filters
 */
export const listAdmins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      is_active,
      search,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    if (role) {
      query.roles = role;
    }

    if (is_active !== undefined) {
      query.is_active = is_active === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [admins, total] = await Promise.all([
      AdminUser.find(query)
        .select("-password")
        .populate("created_by", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AdminUser.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));
    const currentPage = parseInt(page);

    res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: total,
          per_page: parseInt(limit),
          has_prev: currentPage > 1,
          has_next: currentPage < totalPages,
        },
      },
    });
  } catch (error) {
    console.error("List admins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list admins",
      error: error.message,
    });
  }
};

/**
 * Get admin by ID
 */
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminUser.findById(id)
      .select("-password")
      .populate("created_by", "name email");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get admin by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin",
      error: error.message,
    });
  }
};

/**
 * Create new admin
 */
export const createAdmin = async (req, res) => {
  try {
    const { email, password, name, roles } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const admin = new AdminUser({
      email: email.toLowerCase(),
      password,
      name,
      roles: roles || ["moderator"],
      created_by: req.admin._id,
    });

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: adminData,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roles, password } = req.body;

    const admin = await AdminUser.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent admins from demoting themselves
    if (
      admin._id.toString() === req.admin._id.toString() &&
      roles &&
      !roles.includes("admin")
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin role",
      });
    }

    // Update fields
    if (name) admin.name = name;
    if (roles) admin.roles = roles;
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }
      admin.password = password;
    }

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: adminData,
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};

/**
 * Toggle admin status
 */
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminUser.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent admins from deactivating themselves
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    admin.is_active = !admin.is_active;
    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: `Admin ${
        admin.is_active ? "activated" : "deactivated"
      } successfully`,
      data: adminData,
    });
  } catch (error) {
    console.error("Toggle admin status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle admin status",
      error: error.message,
    });
  }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminUser.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent admins from deleting themselves
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};
