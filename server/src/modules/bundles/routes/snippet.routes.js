import { Router } from "express";
import SnippetController from "../controllers/snippet.controller.js";

const router = Router();

// App Snippet endpoint - used by Salla App Snippets feature
router.get("/app-snippet.js", SnippetController.generateAppSnippet);

export default router;
