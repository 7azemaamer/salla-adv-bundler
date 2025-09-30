import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve App Snippet installation guide (correct method for Salla)
router.get("/app-installation", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../../../public/salla-app-installation.html"
  );
  res.sendFile(filePath);
});

export default router;
