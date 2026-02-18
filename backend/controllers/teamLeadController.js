
import { pool } from "../config/db.js";
import { createNotification } from "../utils/notificationService.js";


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
    
    // Prevent multiple active projects
const existingProject = await pool.query(
  `SELECT id FROM projects 
   WHERE intern_id = $1 
   AND status = 'Ongoing'`,
  [internId]
);

if (existingProject.rows.length > 0) {
  return res.status(400).json({
    message: "Intern already has an active project"
  });
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

      await createNotification(
  internId,
  `New project assigned: ${title}`,
  "PROJECT_ASSIGNED"
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



export const reviewSubmission = async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEAD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { submissionId, status, feedback } = req.body;

    // 1️⃣ Update submission
    const updated = await pool.query(
      `UPDATE submissions
       SET status=$1, feedback=$2
       WHERE id=$3
       RETURNING *`,
      [status, feedback, submissionId]
    );

    if (!updated.rows.length) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const submission = updated.rows[0];
    const projectId = submission.project_id;

    // 2️⃣ If approved → check if all submissions approved
    if (status === "Approved") {

      const checkPending = await pool.query(
        `SELECT COUNT(*) FROM submissions
         WHERE project_id=$1
         AND status!='Approved'`,
        [projectId]
      );

      if (parseInt(checkPending.rows[0].count) === 0) {
        await pool.query(
          `UPDATE projects
           SET status='Completed'
           WHERE id=$1`,
          [projectId]
        );
      }
    }

    await createNotification(
  submission.intern_id,
  `Your submission has been ${status}`,
  "FEEDBACK"
);


    res.json({
      message: "Reviewed successfully",
      submission: submission
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Review error" });
  }
};

// /* =========================
//    TEAM LEAD ANALYTICS DASHBOARD
// ========================= */
// export const getTeamLeadDashboard = async (req, res) => {
//   try {
//     if (req.user.role !== "TEAM_LEAD") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     /* -------- PENDING REVIEWS -------- */
//     const pendingReviewsQuery = pool.query(`
//       SELECT COUNT(*) 
//       FROM submissions s
//       JOIN projects p ON s.project_id = p.id
//       WHERE p.team_lead_id = $1
//       AND s.status = 'Pending'
//     `, [req.user.id]);

//     /* -------- MISSED DEADLINES -------- */
//     const missedDeadlinesQuery = pool.query(`
//       SELECT COUNT(*)
//       FROM projects
//       WHERE team_lead_id = $1
//       AND deadline < CURRENT_DATE
//       AND status = 'Ongoing'
//     `, [req.user.id]);

//     /* -------- INTERN PERFORMANCE -------- */
//     const internPerformanceQuery = pool.query(`
//       SELECT 
//         u.id,
//         u.name AS intern,
//         COUNT(s.id) AS totalSubmissions,
//         COUNT(s.id) FILTER (WHERE s.status='Approved') AS approved,
//         CASE 
//           WHEN COUNT(s.id)=0 THEN 0
//           ELSE ROUND(
//             (COUNT(s.id) FILTER (WHERE s.status='Approved')::decimal 
//             / COUNT(s.id)) * 100
//           )
//         END AS progressPercentage
//       FROM users u
//       LEFT JOIN projects p ON p.intern_id = u.id
//       LEFT JOIN submissions s ON s.project_id = p.id
//       WHERE p.team_lead_id = $1
//       AND u.role='INTERN'
//       GROUP BY u.id
//       ORDER BY progressPercentage DESC
//     `, [req.user.id]);

//     const [
//       pendingReviews,
//       missedDeadlines,
//       internPerformance
//     ] = await Promise.all([
//       pendingReviewsQuery,
//       missedDeadlinesQuery,
//       internPerformanceQuery
//     ]);

//     res.json({
//       pendingReviews: parseInt(pendingReviews.rows[0].count),
//       missedDeadlines: parseInt(missedDeadlines.rows[0].count),
//       internPerformance: internPerformance.rows
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Team Lead Dashboard error" });
//   }
// };
export const getTeamLeadDashboard = async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEAD") {
      return res.status(403).json({ message: "Access denied" });
    }

    /* -------- PENDING REVIEWS -------- */
    const pendingReviewsQuery = pool.query(`
      SELECT COUNT(*) 
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      WHERE p.team_lead_id = $1
      AND s.status = 'Pending'
    `, [req.user.id]);

    /* -------- MISSED DEADLINES -------- */
    const missedDeadlinesQuery = pool.query(`
      SELECT COUNT(*)
      FROM projects
      WHERE team_lead_id = $1
      AND deadline < CURRENT_DATE
      AND status = 'Ongoing'
    `, [req.user.id]);

    /* -------- INTERN PERFORMANCE + RANKING -------- */
    const internPerformanceQuery = pool.query(`
      SELECT 
        u.id,
        u.name AS intern,
        COUNT(s.id) AS totalSubmissions,
        COUNT(s.id) FILTER (WHERE s.status='Approved') AS approved,
        COUNT(s.id) FILTER (
          WHERE DATE(s.submitted_at) > p.deadline
        ) AS lateSubmissions,
        CASE 
          WHEN COUNT(s.id)=0 THEN 0
          ELSE ROUND(
            (COUNT(s.id) FILTER (WHERE s.status='Approved')::decimal 
            / COUNT(s.id)) * 100
          )
        END AS approvalRate
      FROM users u
      LEFT JOIN projects p ON p.intern_id = u.id
      LEFT JOIN submissions s ON s.project_id = p.id
      WHERE p.team_lead_id = $1
      AND u.role='INTERN'
      GROUP BY u.id
      ORDER BY approvalRate DESC, totalSubmissions DESC
    `, [req.user.id]);

    const [
      pendingReviews,
      missedDeadlines,
      internPerformance
    ] = await Promise.all([
      pendingReviewsQuery,
      missedDeadlinesQuery,
      internPerformanceQuery
    ]);

    /* -------- RANKING LOGIC -------- */
    const rankedInterns = internPerformance.rows.map((intern, index) => ({
      rank: index + 1,
      ...intern
    }));

    /* -------- GRAPH READY DATA -------- */
    const graphData = rankedInterns.map(intern => ({
      intern: intern.intern,
      approvalRate: parseInt(intern.approvalrate),
      totalSubmissions: parseInt(intern.totalsubmissions),
      lateSubmissions: parseInt(intern.latesubmissions)
    }));

    res.json({
      pendingReviews: parseInt(pendingReviews.rows[0].count),
      missedDeadlines: parseInt(missedDeadlines.rows[0].count),

      internPerformance: rankedInterns,

      performanceGraphData: graphData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Team Lead Dashboard error" });
  }
};


export const completeProject = async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEAD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId } = req.params;

    const result = await pool.query(
      `UPDATE projects 
       SET status='Completed' 
       WHERE id=$1 AND team_lead_id=$2
       RETURNING *`,
      [projectId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project marked as completed",
      project: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Completion error" });
  }
};

export const editProject = async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEAD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId } = req.params;
    const { title, description, deadline } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET title=$1,
           description=$2,
           deadline=$3
       WHERE id=$4 AND team_lead_id=$5
       RETURNING *`,
      [title, description, deadline, projectId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Edit error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEAD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId } = req.params;

    const result = await pool.query(
      `DELETE FROM projects 
       WHERE id=$1 AND team_lead_id=$2
       RETURNING *`,
      [projectId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete error" });
  }
};
