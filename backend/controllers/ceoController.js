
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
export const getCEOAnalyticsDashboard = async (req, res) => {
  try {
    if (req.user.role !== "CEO") {
      return res.status(403).json({ message: "Access denied" });
    }

    /* ===============================
       PARALLEL QUERIES
    =============================== */

    const totalInternsQuery = pool.query(
      "SELECT COUNT(*) FROM users WHERE role='INTERN'"
    );

    const totalProjectsQuery = pool.query(
      "SELECT COUNT(*) FROM projects"
    );

    const projectStatsQuery = pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status='Ongoing') AS active,
        COUNT(*) FILTER (WHERE status='Completed') AS completed
      FROM projects
    `);

    const totalSubmissionsQuery = pool.query(
      "SELECT COUNT(*) FROM submissions"
    );

    const approvedSubmissionsQuery = pool.query(
      "SELECT COUNT(*) FROM submissions WHERE status='Approved'"
    );

    const onTimeSubmissionsQuery = pool.query(
      "SELECT COUNT(*) FROM submissions WHERE is_late = false"
    );

    /* -------- DAILY TREND (Last 7 days) -------- */
    const dailyTrendQuery = pool.query(`
      SELECT 
        DATE(submitted_at) AS day,
        COUNT(*) AS total
      FROM submissions
      GROUP BY day
      ORDER BY day DESC
      LIMIT 7
    `);

    /* -------- WEEKLY TREND (Last 6 weeks) -------- */
    const weeklyTrendQuery = pool.query(`
      SELECT 
        DATE_TRUNC('week', submitted_at) AS week,
        COUNT(*) AS total
      FROM submissions
      GROUP BY week
      ORDER BY week DESC
      LIMIT 6
    `);

    /* -------- FIXED TEAM PERFORMANCE -------- */
    const teamPerformanceQuery = pool.query(`
      SELECT 
        tl.id,
        tl.name AS teamLead,
        COUNT(DISTINCT i.id) AS interns,
        COUNT(DISTINCT p.id) AS projects,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status='Approved') AS approvedSubmissions,
        COUNT(DISTINCT s.id) AS totalSubmissions
      FROM users tl
      LEFT JOIN users i 
        ON i.team_lead_id = tl.id AND i.role='INTERN'
      LEFT JOIN projects p 
        ON p.team_lead_id = tl.id
      LEFT JOIN submissions s 
        ON s.project_id = p.id
      WHERE tl.role='TEAM_LEAD'
      GROUP BY tl.id
      ORDER BY tl.name
    `);

    
    /* -------- PROJECT COMPLETION PERCENTAGE -------- */
    const projectCompletionQuery = pool.query(`
      SELECT 
        p.id,
        p.title,
        COUNT(s.id) AS totalSubmissions,
        SUM(CASE WHEN s.status='Approved' THEN 1 ELSE 0 END) AS approved,
        CASE 
          WHEN COUNT(s.id) = 0 THEN 0
          ELSE ROUND(
            (SUM(CASE WHEN s.status='Approved' THEN 1 ELSE 0 END)::decimal 
            / COUNT(s.id)) * 100
          )
        END AS completionPercentage
      FROM projects p
      LEFT JOIN submissions s ON s.project_id = p.id
      GROUP BY p.id
      ORDER BY p.id
    `);

    const [
      totalInterns,
      totalProjects,
      projectStats,
      totalSubmissions,
      approvedSubmissions,
      onTimeSubmissions,
      dailyTrend,
      weeklyTrend,
      teamPerformance,
      projectCompletion
    ] = await Promise.all([
      totalInternsQuery,
      totalProjectsQuery,
      projectStatsQuery,
      totalSubmissionsQuery,
      approvedSubmissionsQuery,
      onTimeSubmissionsQuery,
      dailyTrendQuery,
      weeklyTrendQuery,
      teamPerformanceQuery,
      projectCompletionQuery

    ]);

    /* ===============================
       CALCULATIONS
    =============================== */

    const interns = parseInt(totalInterns.rows[0].count);
    const projects = parseInt(totalProjects.rows[0].count);
    const activeProjects = parseInt(projectStats.rows[0].active);
    const completedProjects = parseInt(projectStats.rows[0].completed);

    const submissions = parseInt(totalSubmissions.rows[0].count);
    const approved = parseInt(approvedSubmissions.rows[0].count);
    const onTime = parseInt(onTimeSubmissions.rows[0].count);

    const projectCompletionRate =
      projects === 0 ? 0 : Math.round((completedProjects / projects) * 100);

    const submissionApprovalRate =
      submissions === 0 ? 0 : Math.round((approved / submissions) * 100);

    /* -------- REAL PRODUCTIVITY SCORE --------
       50% Approval Rate
       30% On-time Submission Rate
       20% Project Completion Rate
    */

    let productivityScore = 0;

    if (submissions > 0 && projects > 0) {
      productivityScore =
        ( (approved / submissions) * 50 ) +
        ( (onTime / submissions) * 30 ) +
        ( (completedProjects / projects) * 20 );
    }

    productivityScore = Math.round(productivityScore);

    /* ===============================
       RESPONSE
    =============================== */

    res.json({
      totals: {
        interns,
        projects,
        activeProjects,
        completedProjects,
        submissions,
        approvedSubmissions: approved,
        projectCompletionRate,
        submissionApprovalRate
      },

      submissionTrends: {
        daily: dailyTrend.rows,
        weekly: weeklyTrend.rows
      },

      progressTracking: {
        completionPercentage: projectCompletionRate,
        productivityScore
      },
      projectCompletion: projectCompletion.rows,  // 🔥 NEW FEATURE

      teamPerformance: teamPerformance.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "CEO Dashboard error" });
  }
};
