
import { pool } from "../config/db.js";
import { createNotification } from "../utils/notificationService.js";

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



export const submitWork = async (req, res) => {
  try {
    if (req.user.role !== "INTERN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId, title, description } = req.body;

    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ message: "PDF is required" });
    }

    const pdfPath = req.files.pdf[0].filename;

    const additionalDocs = req.files.additionalDocs
      ? req.files.additionalDocs.map(file => file.filename)
      : [];

    // Get project deadline
    const project = await pool.query(
      "SELECT deadline FROM projects WHERE id=$1",
      [projectId]
    );

    if (!project.rows.length) {
      return res.status(404).json({ message: "Project not found" });
    }

    const deadline = project.rows[0].deadline;
    const today = new Date();

    const isLate = today > deadline;

    // Serial number auto increment
    const serialResult = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE project_id=$1",
      [projectId]
    );

    const serialNo = parseInt(serialResult.rows[0].count) + 1;

    const newSubmission = await pool.query(
      `INSERT INTO submissions
       (project_id, intern_id, title, description, pdf_url, additional_docs, serial_no, status, is_late)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Pending',$8)
       RETURNING *`,
      [
        projectId,
        req.user.id,
        title,
        description,
        pdfPath,
        JSON.stringify(additionalDocs),
        serialNo,
        isLate
      ]
    );
    await createNotification(
  project.team_lead_id,
  `New submission uploaded by ${req.user.name}`,
  "SUBMISSION_UPLOADED"
);



    res.status(201).json({
      message: isLate
        ? "Submitted (Late Submission)"
        : "Submitted Successfully",
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
