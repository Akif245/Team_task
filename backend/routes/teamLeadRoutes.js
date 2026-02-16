import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  createNewProject,
  reviewWork
} from "../controllers/teamLeadController.js";

const router = express.Router();

router.post(
  "/create-project",
  authenticate,
  authorizeRoles("TEAM_LEAD"),
  createNewProject
);

router.put(
  "/review/:id",
  authenticate,
  authorizeRoles("TEAM_LEAD"),
  reviewWork
);

export default router;
