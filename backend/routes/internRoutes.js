import express from "express";
import multer from "multer";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { getMyProjects, submitWork } from "../controllers/internController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get(
  "/projects",
  authenticate,
  authorizeRoles("INTERN"),
  getMyProjects
);

router.post(
  "/submit",
  authenticate,
  authorizeRoles("INTERN"),
  upload.single("file"),
  submitWork
);

export default router;
