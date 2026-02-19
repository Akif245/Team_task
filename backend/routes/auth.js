import express from "express";
import {
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  updateProfile
} from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/* LOGIN */
router.post("/login", login);

/* REFRESH */
router.post("/refresh", refreshToken);

/* LOGOUT */
router.post("/logout", auth, logout);

/* PASSWORD RESET */
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

/* PROFILE UPDATE */
router.put("/profile", auth, updateProfile);

export default router;
