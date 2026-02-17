
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createIntern,
  assignIntern,
  getHRAnalyticsDashboard,
} from "../controllers/hrController.js";

const router = express.Router();

router.post("/create-intern", auth, createIntern);
router.put("/assign-intern", auth, assignIntern);
router.get("/analytics-dashboard", auth, getHRAnalyticsDashboard);

export default router;
