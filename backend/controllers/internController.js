// import { getProjectsByIntern } from "../models/projectModel.js";
// import { createSubmission } from "../models/submissionModel.js";

// export const getMyProjects = async (req, res) => {
//   const result = await getProjectsByIntern(req.user.id);
//   res.json(result.rows);
// };

// export const submitWork = async (req, res) => {
//   const { project_id, title, description } = req.body;

//   await createSubmission(
//     project_id,
//     req.user.id,
//     title,
//     description,
//     req.file.path
//   );

//   res.json({ message: "Submission uploaded", status: "PENDING" });
// };
import { pool } from "../config/db.js";

/* =========================
   GET ASSIGNED PROJECT
========================= */
export const getMyProject = async (req, res) => {
  try {
    if (req.user.role !== "INTERN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const project = await pool.query(
      "SELECT * FROM projects WHERE intern_id=$1",
      [req.user.id]
    );

    res.json(project.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

/* =========================
   SUBMIT WEEKLY WORK
========================= */
export const submitWork = async (req, res) => {
  try {
    if (req.user.role !== "INTERN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, pdf_url } = req.body;

    // Find assigned project
    const project = await pool.query(
      "SELECT * FROM projects WHERE intern_id=$1",
      [req.user.id]
    );

    if (!project.rows.length) {
      return res.status(404).json({ message: "No assigned project found" });
    }

    const projectId = project.rows[0].id;

    // Auto increment serial number
    const serialCheck = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE project_id=$1",
      [projectId]
    );

    const serial_no = parseInt(serialCheck.rows[0].count) + 1;

    const newSubmission = await pool.query(
      `INSERT INTO submissions
       (serial_no, intern_id, project_id, title, description, pdf_url, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,'Pending',NOW())
       RETURNING *`,
      [
        serial_no,
        req.user.id,
        projectId,
        title,
        description,
        pdf_url
      ]
    );

    res.status(201).json({
      message: "Submission uploaded successfully",
      submission: newSubmission.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Submission error" });
  }
};

/* =========================
   VIEW MY SUBMISSIONS
========================= */
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await pool.query(
      "SELECT * FROM submissions WHERE intern_id=$1 ORDER BY serial_no ASC",
      [req.user.id]
    );

    res.json(submissions.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
};

/* =========================
   PROGRESS TRACKER
========================= */
export const getProgress = async (req, res) => {
  try {
    const total = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE intern_id=$1",
      [req.user.id]
    );

    const approved = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE intern_id=$1 AND status='Approved'",
      [req.user.id]
    );

    const totalCount = parseInt(total.rows[0].count);
    const approvedCount = parseInt(approved.rows[0].count);

    const progress = totalCount === 0
      ? 0
      : Math.round((approvedCount / totalCount) * 100);

    res.json({
      totalSubmissions: totalCount,
      approvedSubmissions: approvedCount,
      progressPercentage: progress
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating progress" });
  }
};
