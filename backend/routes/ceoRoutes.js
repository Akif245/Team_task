
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  assignTeamLead,
  getAllProjectProgress,
  getCEOAnalyticsDashboard
} from "../controllers/ceoController.js";

const router = express.Router();

router.put("/assign-teamlead", auth, assignTeamLead);
router.get("/project-progress", auth, getAllProjectProgress);
router.get("/analytics-dashboard", auth, getCEOAnalyticsDashboard);
export default router;
