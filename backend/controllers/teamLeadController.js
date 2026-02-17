
import { pool } from "../config/db.js";

/* =========================
   CREATE PROJECT
========================= */
export const createNewProject = async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEAD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, start_date, deadline, internId } = req.body;

    const intern = await pool.query(
      "SELECT * FROM users WHERE id=$1 AND role='INTERN'",
      [internId]
    );

    if (!intern.rows.length) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const newProject = await pool.query(
      `INSERT INTO projects 
       (title, description, start_date, deadline, intern_id, team_lead_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,'Ongoing')
       RETURNING *`,
      [
        title,
        description,
        start_date,
        deadline,
        internId,
        req.user.id
      ]
    );

    res.status(201).json({
      message: "Project created successfully",
      project: newProject.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Create project error" });
  }
};

/* =========================
   GET MY INTERNS
========================= */
export const getMyInterns = async (req, res) => {
  try {
    const interns = await pool.query(
      "SELECT id, name, email FROM users WHERE team_lead_id=$1 AND role='INTERN'",
      [req.user.id]
    );

    res.json(interns.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching interns" });
  }
};

/* =========================
   GET MY PROJECTS
========================= */
export const getMyProjects = async (req, res) => {
  try {
    const projects = await pool.query(
      "SELECT * FROM projects WHERE team_lead_id=$1",
      [req.user.id]
    );

    res.json(projects.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

/* =========================
   GET PROJECT SUBMISSIONS
========================= */
export const getProjectSubmissions = async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE id=$1 AND team_lead_id=$2",
      [projectId, req.user.id]
    );

    if (!projectCheck.rows.length) {
      return res.status(404).json({ message: "Unauthorized or project not found" });
    }

    const submissions = await pool.query(
      "SELECT * FROM submissions WHERE project_id=$1",
      [projectId]
    );

    res.json(submissions.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
};

/* =========================
   REVIEW SUBMISSION (SECURE)
========================= */
export const reviewWork = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    const allowedStatus = ["Approved", "Rejected", "Changes Requested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Ensure submission belongs to this team lead
    const check = await pool.query(
      `SELECT s.id FROM submissions s
       JOIN projects p ON s.project_id = p.id
       WHERE s.id=$1 AND p.team_lead_id=$2`,
      [submissionId, req.user.id]
    );

    if (!check.rows.length) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const updated = await pool.query(
      `UPDATE submissions
       SET status=$1, feedback=$2, reviewed_at=NOW()
       WHERE id=$3
       RETURNING *`,
      [status, feedback, submissionId]
    );

    res.json({
      message: "Submission reviewed successfully",
      submission: updated.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Review error" });
  }
};
