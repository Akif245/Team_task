
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

/* =========================
   CREATE INTERN
========================= */
export const createIntern = async (req, res) => {
  try {
    if (req.user.role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name,email,password,role)
       VALUES ($1,$2,$3,'INTERN')
       RETURNING id,name,email,role`,
      [name, email, hash]
    );

    res.status(201).json({
      message: "Intern created successfully",
      intern: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create intern error" });
  }
};

/* =========================
   ASSIGN / REASSIGN INTERN
========================= */
export const assignIntern = async (req, res) => {
  try {
    if (req.user.role !== "HR") {
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
      message: "Intern assigned successfully",
      internId,
      teamLeadId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assign error" });
  }
};

/* =========================
   HR ANALYTICS + DASHBOARD
========================= */
export const getHRAnalyticsDashboard = async (req, res) => {
  try {
    if (req.user.role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }

    /* -------- TOTAL INTERNS -------- */
    const totalInternsQuery = pool.query(
      "SELECT COUNT(*) FROM users WHERE role='INTERN'"
    );

    /* -------- INTERN COUNT PER TEAM LEAD -------- */
    const internsPerTeamLeadQuery = pool.query(`
      SELECT 
        t.id,
        t.name AS teamLead,
        COUNT(i.id) AS internCount
      FROM users t
      LEFT JOIN users i
        ON i.team_lead_id = t.id AND i.role='INTERN'
      WHERE t.role='TEAM_LEAD'
      GROUP BY t.id
      ORDER BY t.name
    `);

    /* -------- PROJECT STATS -------- */
    const projectStatsQuery = pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status='Ongoing') AS active,
        COUNT(*) FILTER (WHERE status='Completed') AS completed
      FROM projects
    `);

    /* -------- DELAYED PROJECTS -------- */
    const delayedProjectsQuery = pool.query(`
      SELECT COUNT(*)
      FROM projects
      WHERE deadline < CURRENT_DATE
      AND status='Ongoing'
    `);

    /* 🔥 -------- DELAYED SUBMISSIONS -------- */
    const delayedSubmissionsQuery = pool.query(`
      SELECT COUNT(*)
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      WHERE s.status = 'Pending'
      AND p.deadline < CURRENT_DATE
    `);

    /* -------- SUBMISSION TRACKING -------- */
    const submissionTrackingQuery = pool.query(`
      SELECT 
        i.id,
        i.name AS intern,
        COUNT(s.id) AS totalSubmissions,
        COUNT(s.id) FILTER (WHERE s.status='Approved') AS approved,
        COUNT(s.id) FILTER (WHERE s.status='Rejected') AS rejected,
        COUNT(s.id) FILTER (WHERE s.status='Pending') AS pending
      FROM users i
      LEFT JOIN submissions s
        ON s.intern_id = i.id
      WHERE i.role='INTERN'
      GROUP BY i.id
      ORDER BY i.name
    `);

    /* -------- EXECUTE ALL QUERIES IN PARALLEL -------- */
    const [
      totalInterns,
      internsPerTeamLead,
      projectStats,
      delayedProjects,
      delayedSubmissions,
      submissionTracking
    ] = await Promise.all([
      totalInternsQuery,
      internsPerTeamLeadQuery,
      projectStatsQuery,
      delayedProjectsQuery,
      delayedSubmissionsQuery, // 🔥 added here
      submissionTrackingQuery
    ]);

    /* -------- FINAL RESPONSE -------- */
    res.json({
      totals: {
        interns: parseInt(totalInterns.rows[0].count),
        activeProjects: parseInt(projectStats.rows[0].active),
        completedProjects: parseInt(projectStats.rows[0].completed),
        delayedProjects: parseInt(delayedProjects.rows[0].count),
        delayedSubmissions: parseInt(delayedSubmissions.rows[0].count) // 🔥 added here
      },
      internsPerTeamLead: internsPerTeamLead.rows,
      submissionTracking: submissionTracking.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "HR Analytics Dashboard error" });
  }
};
