
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
   HR ANALYTICS
========================= */
export const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalInterns = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='INTERN'"
    );

    const internsPerTeamLead = await pool.query(`
      SELECT t.name AS teamLead,
             COUNT(i.id) AS internCount
      FROM users t
      LEFT JOIN users i
      ON i.team_lead_id = t.id AND i.role='INTERN'
      WHERE t.role='TEAM_LEAD'
      GROUP BY t.name
    `);

    const delayedProjects = await pool.query(`
      SELECT COUNT(*)
      FROM projects
      WHERE deadline < CURRENT_DATE
      AND status='Ongoing'
    `);

    const activeProjects = await pool.query(`
      SELECT COUNT(*)
      FROM projects
      WHERE status='Ongoing'
    `);

    const completedProjects = await pool.query(`
      SELECT COUNT(*)
      FROM projects
      WHERE status='Completed'
    `);

    res.json({
      totals: {
        interns: totalInterns.rows[0].count,
        activeProjects: activeProjects.rows[0].count,
        completedProjects: completedProjects.rows[0].count,
        delayedProjects: delayedProjects.rows[0].count
      },
      internsPerTeamLead: internsPerTeamLead.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics error" });
  }
};
