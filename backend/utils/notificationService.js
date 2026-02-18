import { pool } from "../config/db.js";

export const createNotification = async (userId, message, type) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES ($1, $2, $3)`,
      [userId, message, type]
    );
  } catch (error) {
    console.error("Notification Error:", error);
  }
};
