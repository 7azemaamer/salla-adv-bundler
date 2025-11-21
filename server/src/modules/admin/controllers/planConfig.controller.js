import planService from "../services/planConfig.service.js";

/**
 * Get all plans
 */
export const getAllPlans = async (req, res) => {
  try {
    const plans = await planService.getAllPlans();

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Get all plans error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch plans",
    });
  }
};

/**
 * Get plan by ID/key
 */
export const getPlanById = async (req, res) => {
  try {
    const { planKey } = req.params;
    const plan = await planService.getPlanById(planKey);

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Get plan by ID error:", error);
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch plan",
    });
  }
};

/**
 * Update plan
 */
export const updatePlan = async (req, res) => {
  try {
    const { planKey } = req.params;
    const updates = req.body;

    const plan = await planService.updatePlan(planKey, updates);

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Update plan error:", error);

    // Better error status codes
    let statusCode = 500;
    if (error.message.includes("not found")) {
      statusCode = 404;
    } else if (
      error.message.includes("non-negative") ||
      error.message.includes("must be")
    ) {
      statusCode = 400;
    } else if (error.name === "ValidationError") {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update plan",
    });
  }
};

/**
 * Create new plan
 */
export const createPlan = async (req, res) => {
  try {
    const planData = req.body;

    const plan = await planService.createPlan(planData);

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(error.message.includes("already exists") ? 409 : 500).json({
      success: false,
      message: error.message || "Failed to create plan",
    });
  }
};

/**
 * Delete plan
 */
export const deletePlan = async (req, res) => {
  try {
    const { planKey } = req.params;

    await planService.deletePlan(planKey);

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    res
      .status(
        error.message.includes("Cannot delete")
          ? 403
          : error.message.includes("not found")
          ? 404
          : 500
      )
      .json({
        success: false,
        message: error.message || "Failed to delete plan",
      });
  }
};

/**
 * Get available features
 */
export const getAvailableFeatures = async (req, res) => {
  try {
    const features = await planService.getAvailableFeatures();

    res.status(200).json({
      success: true,
      data: features,
    });
  } catch (error) {
    console.error("Get available features error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available features",
    });
  }
};

/**
 * Reset plan to default
 */
export const resetPlanToDefault = async (req, res) => {
  try {
    const { planKey } = req.params;

    const plan = await planService.resetPlanToDefault(planKey);

    res.status(200).json({
      success: true,
      message: "Plan reset to default configuration",
      data: plan,
    });
  } catch (error) {
    console.error("Reset plan error:", error);
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to reset plan",
    });
  }
};
