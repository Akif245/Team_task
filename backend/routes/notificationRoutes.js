import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", auth, getNotifications);
router.put("/read/:id", auth, markAsRead);

export default router;
