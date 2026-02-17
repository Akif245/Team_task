
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  assignTeamLead,
  getCompanyAnalytics,
  getAllProjectProgress
} from "../controllers/ceoController.js";

const router = express.Router();

router.put("/assign-teamlead", auth, assignTeamLead);
router.get("/analytics", auth, getCompanyAnalytics);
router.get("/project-progress", auth, getAllProjectProgress);

export default router;
