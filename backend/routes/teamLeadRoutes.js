
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createNewProject,
  getMyInterns,
  getMyProjects,
  getProjectSubmissions,
  reviewWork,
  getTeamLeadDashboard
} from "../controllers/teamLeadController.js";

const router = express.Router();

router.post("/create-project", auth, createNewProject);
router.get("/my-interns", auth, getMyInterns);
router.get("/my-projects", auth, getMyProjects);
router.get("/project-submissions/:projectId", auth, getProjectSubmissions);
router.put("/review/:submissionId", auth, reviewWork);
router.get("/dashboard", auth, getTeamLeadDashboard);

export default router;
