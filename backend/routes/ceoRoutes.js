import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { getAnalytics } from "../controllers/ceoController.js";

const router = express.Router();

router.get(
  "/analytics",
  authenticate,
  authorizeRoles("CEO"),
  getAnalytics
);

export default router;
