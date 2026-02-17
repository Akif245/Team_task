
import { pool } from "../config/db.js";

/* =========================
   ASSIGN TEAM LEAD TO INTERN
========================= */
export const assignTeamLead = async (req, res) => {
  try {
    if (req.user.role !== "CEO") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { internId, teamLeadId } = req.body;

    if (!internId || !teamLeadId) {
      return res.status(400).json({ message: "internId and teamLeadId required" });
    }

    const intern = await pool.query(
      "SELECT id FROM users WHERE id=$1 AND role='INTERN'",
      [internId]
    );

    if (!intern.rows.length) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const teamLead = await pool.query(
      "SELECT id FROM users WHERE id=$1 AND role='TEAM_LEAD'",
      [teamLeadId]
    );

    if (!teamLead.rows.length) {
      return res.status(404).json({ message: "Team Lead not found" });
    }

    await pool.query(
      "UPDATE users SET team_lead_id=$1 WHERE id=$2",
      [teamLeadId, internId]
    );

    res.json({
      message: "Team Lead assigned successfully",
      internId,
      teamLeadId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assignment error" });
  }
};

/* =========================
   COMPANY ANALYTICS
========================= */
export const getCompanyAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "CEO") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalInterns = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='INTERN'"
    );

    const totalProjects = await pool.query(
      "SELECT COUNT(*) FROM projects"
    );

    const totalSubmissions = await pool.query(
      "SELECT COUNT(*) FROM submissions"
    );

    const approvedSubmissions = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE status='Approved'"
    );

    const completionRate =
      totalSubmissions.rows[0].count == 0
        ? 0
        : Math.round(
            (approvedSubmissions.rows[0].count /
              totalSubmissions.rows[0].count) *
              100
          );

    const teamPerformance = await pool.query(`
      SELECT 
        t.name AS teamLead,
        COUNT(s.id) AS totalSubmissions,
        SUM(CASE WHEN s.status='Approved' THEN 1 ELSE 0 END) AS approved
      FROM users t
      LEFT JOIN projects p ON p.team_lead_id = t.id
      LEFT JOIN submissions s ON s.project_id = p.id
      WHERE t.role='TEAM_LEAD'
      GROUP BY t.name
    `);

    res.json({
      totals: {
        interns: totalInterns.rows[0].count,
        projects: totalProjects.rows[0].count,
        submissions: totalSubmissions.rows[0].count,
        completionRate: completionRate
      },
      teamPerformance: teamPerformance.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics error" });
  }
};

/* =========================
   VIEW ALL PROJECT PROGRESS
========================= */
export const getAllProjectProgress = async (req, res) => {
  try {
    if (req.user.role !== "CEO") {
      return res.status(403).json({ message: "Access denied" });
    }

    const progress = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.status,
        u.name AS intern,
        t.name AS teamLead,
        p.deadline
      FROM projects p
      JOIN users u ON p.intern_id = u.id
      JOIN users t ON p.team_lead_id = t.id
      ORDER BY p.created_at DESC
    `);

    res.json(progress.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Progress fetch error" });
  }
};
