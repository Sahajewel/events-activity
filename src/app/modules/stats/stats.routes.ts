import { Router } from "express";
import * as statsController from "./stats.controller";

const router = Router();

// 🌐 Public route - no authentication needed
router.get("/public", statsController.getPublicStats);

export const StatsRoutes = router;
