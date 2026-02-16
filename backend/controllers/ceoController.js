import pool from "../db.js";

export const getAnalytics = async (req, res) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status='APPROVED') AS approved,
      COUNT(*) FILTER (WHERE status='REJECTED') AS rejected,
      COUNT(*) FILTER (WHERE status='PENDING') AS pending
    FROM submissions
  `);

  res.json(result.rows[0]);
};
