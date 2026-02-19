
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
    console.log("Server time:", today);
console.log("Deadline from DB:", deadline);
    const isLate = today > deadline;

    // Serial number auto increment
    const serialResult = await pool.query(
      `SELECT COALESCE(MAX(serial_no), 0) + 1 AS next_serial
   FROM submissions
   WHERE project_id=$1`,
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

// Get intern name
const internResult = await pool.query(
  `SELECT name FROM users WHERE id=$1`,
  [req.user.id]
);

const internName = internResult.rows[0].name;

// Get team lead id
const teamLeadResult = await pool.query(
  `SELECT team_lead_id FROM projects WHERE id=$1`,
  [projectId]
);

const teamLeadId = teamLeadResult.rows[0].team_lead_id;

// Create notification
await createNotification(
  teamLeadId,
  `New submission uploaded by ${internName}`,
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
    if (req.user.role !== "INTERN") {
      return res.status(403).json({ message: "Access denied" });
    }

    /* ===============================
       RUN ALL QUERIES IN PARALLEL
    =============================== */

    const totalQuery = pool.query(
      "SELECT COUNT(*) FROM submissions WHERE intern_id=$1",
      [req.user.id]
    );

    const approvedQuery = pool.query(
      "SELECT COUNT(*) FROM submissions WHERE intern_id=$1 AND status='Approved'",
      [req.user.id]
    );

    const submissionConsistencyQuery = pool.query(`
      SELECT 
        TO_CHAR(submitted_at, 'IYYY-IW') AS week,
        COUNT(*) AS submissions
      FROM submissions
      WHERE intern_id = $1
      GROUP BY week
      ORDER BY week
    `, [req.user.id]);

    const timelineQuery = pool.query(`
      SELECT 
        s.id,
        s.title,
        s.status,
        s.submitted_at,
        p.deadline,
        s.is_late
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      WHERE s.intern_id = $1
      ORDER BY s.submitted_at ASC
    `, [req.user.id]);

    const progressHistoryQuery = pool.query(`
      SELECT 
        serial_no,
        status,
        is_late,
        submitted_at
      FROM submissions
      WHERE intern_id = $1
      ORDER BY serial_no ASC
    `, [req.user.id]);

    const [
      total,
      approved,
      submissionConsistency,
      timeline,
      progressHistory
    ] = await Promise.all([
      totalQuery,
      approvedQuery,
      submissionConsistencyQuery,
      timelineQuery,
      progressHistoryQuery
    ]);

    /* ===============================
       CALCULATIONS
    =============================== */

    const totalCount = parseInt(total.rows[0].count);
    const approvedCount = parseInt(approved.rows[0].count);

    const progressPercentage =
      totalCount === 0
        ? 0
        : Math.round((approvedCount / totalCount) * 100);

    /* ===============================
       RESPONSE
    =============================== */

    res.json({
      summary: {
        totalSubmissions: totalCount,
        approvedSubmissions: approvedCount,
        completionPercentage: progressPercentage
      },

      submissionConsistency: submissionConsistency.rows,

      timelineTracker: timeline.rows,

      progressHistory: progressHistory.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating progress" });
  }
};
