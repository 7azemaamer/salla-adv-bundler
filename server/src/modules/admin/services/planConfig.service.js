import PlanConfig from "../model/planConfig.model.js";
import {
  PLAN_CONFIG as PLAN_TEMPLATES,
  BASE_PLAN_FEATURES,
} from "../../stores/constants/planConfig.js";

class PlanConfigService {
  /**
   * Get all plan configurations from DB or fallback to templates
   */
  async getAllPlans() {
    try {
      let plans = await PlanConfig.find({ isActive: true }).sort({ key: 1 });

      // If no plans in DB, initialize from templates
      if (plans.length === 0) {
        plans = await this.initializePlansFromTemplates();
      }

      return plans;
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw new Error("Failed to fetch plan configurations");
    }
  }

  /**
   * Get a specific plan by key
   */
  async getPlanById(planKey) {
    try {
      let plan = await PlanConfig.findOne({ key: planKey, isActive: true });

      // Fallback to template if not in DB
      if (!plan) {
        const template = PLAN_TEMPLATES[planKey];
        if (!template) {
          throw new Error(`Plan ${planKey} not found`);
        }
        // Create from template
        plan = await this.createPlan(template);
      }

      return plan;
    } catch (error) {
      console.error(`Error fetching plan ${planKey}:`, error);
      throw error;
    }
  }

  /**
   * Update plan configuration
   */
  async updatePlan(planKey, updates) {
    try {
      const allowedUpdates = [
        "label",
        "limits",
        "features",
        "description",
        "price",
        "currency",
      ];
      const filteredUpdates = {};

      // Filter allowed fields
      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // Validate limits if provided
      if (filteredUpdates.limits) {
        if (filteredUpdates.limits.maxBundles !== undefined) {
          filteredUpdates.limits.maxBundles = Math.max(
            0,
            Number(filteredUpdates.limits.maxBundles)
          );
        }
        if (
          filteredUpdates.limits.monthlyViews !== null &&
          filteredUpdates.limits.monthlyViews !== undefined
        ) {
          filteredUpdates.limits.monthlyViews = Math.max(
            0,
            Number(filteredUpdates.limits.monthlyViews)
          );
        }
      }

      const plan = await PlanConfig.findOneAndUpdate(
        { key: planKey },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
      );

      if (!plan) {
        throw new Error(`Plan ${planKey} not found`);
      }

      return plan;
    } catch (error) {
      console.error(`Error updating plan ${planKey}:`, error);
      throw error;
    }
  }

  /**
   * Create a new plan configuration
   */
  async createPlan(planData) {
    try {
      const existingPlan = await PlanConfig.findOne({ key: planData.key });
      if (existingPlan) {
        throw new Error(`Plan with key ${planData.key} already exists`);
      }

      const plan = new PlanConfig({
        key: planData.key,
        label: planData.label,
        limits: planData.limits || { maxBundles: 1, monthlyViews: 10000 },
        features: planData.features || { ...BASE_PLAN_FEATURES },
        description: planData.description || "",
        price: planData.price || 0,
        currency: planData.currency || "SAR",
      });

      await plan.save();
      return plan;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  }

  /**
   * Delete a plan (soft delete by setting isActive to false)
   */
  async deletePlan(planKey) {
    try {
      // Prevent deletion of basic plan
      if (planKey === "basic") {
        throw new Error("Cannot delete the basic plan");
      }

      const plan = await PlanConfig.findOneAndUpdate(
        { key: planKey },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!plan) {
        throw new Error(`Plan ${planKey} not found`);
      }

      return plan;
    } catch (error) {
      console.error(`Error deleting plan ${planKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all available feature flags
   */
  async getAvailableFeatures() {
    return {
      features: Object.keys(BASE_PLAN_FEATURES).map((key) => ({
        key,
        label: this.formatFeatureLabel(key),
        default: BASE_PLAN_FEATURES[key],
      })),
    };
  }

  /**
   * Reset plan to default template configuration
   */
  async resetPlanToDefault(planKey) {
    try {
      const template = PLAN_TEMPLATES[planKey];
      if (!template) {
        throw new Error(`No template found for plan ${planKey}`);
      }

      const plan = await PlanConfig.findOneAndUpdate(
        { key: planKey },
        {
          $set: {
            label: template.label,
            limits: template.limits,
            features: template.features,
          },
        },
        { new: true, upsert: true }
      );

      return plan;
    } catch (error) {
      console.error(`Error resetting plan ${planKey}:`, error);
      throw error;
    }
  }

  /**
   * Initialize plans from templates (one-time setup)
   */
  async initializePlansFromTemplates() {
    try {
      const plans = [];
      for (const [key, template] of Object.entries(PLAN_TEMPLATES)) {
        const existingPlan = await PlanConfig.findOne({ key });
        if (!existingPlan) {
          const plan = await this.createPlan(template);
          plans.push(plan);
        } else {
          plans.push(existingPlan);
        }
      }
      return plans;
    } catch (error) {
      console.error("Error initializing plans:", error);
      throw error;
    }
  }

  /**
   * Format feature key to readable label
   */
  formatFeatureLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Get plan config for use in business logic (cached or from DB)
   */
  async getPlanConfigForStore(planKey = "basic") {
    try {
      const plan = await this.getPlanById(planKey);
      return {
        key: plan.key,
        label: plan.label,
        limits: plan.limits,
        features: plan.features,
      };
    } catch (error) {
      // Fallback to template if DB query fails
      console.warn(`Falling back to template for plan ${planKey}`);
      return PLAN_TEMPLATES[planKey] || PLAN_TEMPLATES.basic;
    }
  }
}

export default new PlanConfigService();
