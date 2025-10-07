import TimerSettings from "../model/timerSettings.model.js";

/**
 * Get timer settings for a store
 */
export const getTimerSettings = async (req, res) => {
  try {
    const { storeId } = req.params;

    let settings = await TimerSettings.findOne({ store_id: storeId });

    // If no settings found, return defaults
    if (!settings) {
      return res.json({
        success: true,
        data: TimerSettings.getDefaultSettings(),
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get timer settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get timer settings",
      error: error.message,
    });
  }
};

/**
 * Update timer settings for a store
 */
export const updateTimerSettings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updates = req.body;

    // Validate duration if provided
    if (updates.duration) {
      if (updates.duration < 300 || updates.duration > 86400) {
        return res.status(400).json({
          success: false,
          message:
            "Duration must be between 5 minutes (300s) and 24 hours (86400s)",
        });
      }
    }

    // Validate border radius
    if (updates.style?.border_radius) {
      if (updates.style.border_radius < 0 || updates.style.border_radius > 50) {
        return res.status(400).json({
          success: false,
          message: "Border radius must be between 0 and 50 pixels",
        });
      }
    }

    // Validate font size
    if (updates.style?.font_size) {
      if (updates.style.font_size < 10 || updates.style.font_size > 24) {
        return res.status(400).json({
          success: false,
          message: "Font size must be between 10 and 24 pixels",
        });
      }
    }

    const settings = await TimerSettings.findOneAndUpdate(
      { store_id: storeId },
      {
        $set: {
          store_id: storeId,
          ...updates,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Timer settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update timer settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update timer settings",
      error: error.message,
    });
  }
};

/**
 * Reset timer settings to defaults
 */
export const resetTimerSettings = async (req, res) => {
  try {
    const { storeId } = req.params;

    const settings = await TimerSettings.findOneAndUpdate(
      { store_id: storeId },
      {
        $set: {
          store_id: storeId,
          ...TimerSettings.getDefaultSettings(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      success: true,
      message: "Timer settings reset to defaults",
      data: settings,
    });
  } catch (error) {
    console.error("Reset timer settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset timer settings",
      error: error.message,
    });
  }
};

/**
 * Get timer CSS for embedding in modal
 */
export const getTimerCSS = async (req, res) => {
  try {
    const { storeId } = req.params;

    let settings = await TimerSettings.findOne({ store_id: storeId });

    if (!settings) {
      settings = new TimerSettings({
        store_id: storeId,
        ...TimerSettings.getDefaultSettings(),
      });
    }

    res.setHeader("Content-Type", "text/css");
    res.send(settings.getCSSVariables());
  } catch (error) {
    console.error("Get timer CSS error:", error);
    res.status(500).send("/* Error loading timer styles */");
  }
};
