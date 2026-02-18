
import express from "express";
import auth from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getMyProject,
  submitWork,
  getMySubmissions,
  getProgress
} from "../controllers/internController.js";

const router = express.Router();

router.get("/my-project", auth, getMyProject);
router.post(
  "/submit",
  auth,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "additionalDocs", maxCount: 3 }
  ]),
  submitWork
);
router.get("/my-submissions", auth, getMySubmissions);
router.get("/progress", auth, getProgress);

export default router;

