import { asyncWrapper } from "../../../utils/errorHandler.js";

/* ===============================================
 * Validate JWT token - simple endpoint for frontend auth check
 * =============================================== */
export const validateToken = asyncWrapper(async (req, res) => {
  // If we reach here, the token is valid (middleware passed)
  res.status(200).json({
    success: true,
    data: {
      store_id: req.user.store_id,
      name: req.user.name,
      domain: req.user.domain
    }
  });
});