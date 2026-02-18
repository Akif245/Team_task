import { pool } from "../config/db.js";

/* =========================
   GET MY NOTIFICATIONS
========================= */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(notifications.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetch error" });
  }
};

/* =========================
   MARK AS READ
========================= */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE notifications
       SET is_read=TRUE
       WHERE id=$1 AND user_id=$2`,
      [id, req.user.id]
    );

    res.json({ message: "Marked as read" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update error" });
  }
};
