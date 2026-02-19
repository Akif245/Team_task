import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/* =============================
   TOKEN GENERATORS
============================= */

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // short expiry
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

/* =============================
   LOGIN
============================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!userResult.rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    await pool.query(
      `UPDATE users 
       SET refresh_token=$1, refresh_token_expiry=$2
       WHERE id=$3`,
      [refreshToken, expiry, user.id]
    );

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      role: user.role,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
};

/* =============================
   REFRESH TOKEN
============================= */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const result = await pool.query(
      "SELECT * FROM users WHERE refresh_token=$1",
      [refreshToken]
    );

    if (!result.rows.length)
      return res.status(403).json({ message: "Invalid refresh token" });

    const user = result.rows[0];

    if (new Date() > user.refresh_token_expiry)
      return res.status(403).json({ message: "Refresh token expired" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Invalid refresh token" });

        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Refresh error" });
  }
};

/* =============================
   LOGOUT
============================= */
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      "UPDATE users SET refresh_token=NULL, refresh_token_expiry=NULL WHERE id=$1",
      [userId]
    );

    res.json({ message: "Logged out successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout error" });
  }
};

/* =============================
   REQUEST PASSWORD RESET
============================= */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      `UPDATE users 
       SET reset_token=$1, reset_token_expiry=$2
       WHERE email=$3`,
      [resetToken, expiry, email]
    );

    // In production → send via email
    res.json({
      message: "Reset token generated",
      resetToken
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reset request error" });
  }
};

/* =============================
   RESET PASSWORD
============================= */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token=$1",
      [token]
    );

    if (!result.rows.length)
      return res.status(400).json({ message: "Invalid token" });

    const user = result.rows[0];

    if (new Date() > user.reset_token_expiry)
      return res.status(400).json({ message: "Token expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users 
       SET password=$1, reset_token=NULL, reset_token_expiry=NULL
       WHERE id=$2`,
      [hashedPassword, user.id]
    );

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reset error" });
  }
};

/* =============================
   PROFILE UPDATE
============================= */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE id=$3",
      [name, email, userId]
    );

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile update error" });
  }
};
