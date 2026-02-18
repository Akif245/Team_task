
import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createNewProject,
  getMyInterns,
  getMyProjects,
  getProjectSubmissions,
  reviewSubmission,
  getTeamLeadDashboard,
  completeProject,
  editProject,
  deleteProject
} from "../controllers/teamLeadController.js";

const router = express.Router();

router.post("/create-project", auth, createNewProject);
router.get("/my-interns", auth, getMyInterns);
router.get("/my-projects", auth, getMyProjects);
router.get("/project-submissions/:projectId", auth, getProjectSubmissions);
router.put("/review/:submissionId", auth, reviewSubmission );
router.get("/dashboard", auth, getTeamLeadDashboard);
router.put("/complete/:projectId", auth, completeProject);
router.put("/edit/:projectId", auth, editProject);
router.delete("/delete/:projectId", auth, deleteProject);

export default router;
