// import express from "express";
// import {pool} from "../config/db.js";

// const router = express.Router();

// /*
//   POST /api/submissions/submit
// */
// router.post("/submit", async (req, res) => {
//   const { project_id, title, description, pdf_url } = req.body;

//   try {
//     const project = await pool.query(
//       "SELECT intern_id FROM projects WHERE id = $1",
//       [project_id]
//     );

//     if (project.rows.length === 0) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     const intern_id = project.rows[0].intern_id;

//     const result = await pool.query(
//       `INSERT INTO submissions 
//        (project_id, intern_id, title, description, pdf_url, status)
//        VALUES ($1, $2, $3, $4, $5, 'PENDING')
//        RETURNING *`,
//       [project_id, intern_id, title, description, pdf_url]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error submitting project" });
//   }
// });


// /*
//   GET /api/submissions/all
// */
// router.get("/all", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM submissions");
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching submissions" });
//   }
// });

// /*
//   GET /api/submissions/project/:id
// */
// router.get("/project/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       "SELECT * FROM submissions WHERE project_id = $1",
//       [id]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching submissions" });
//   }
// });


// /*
//   GET /api/submissions/intern/:id
// */
// router.get("/intern/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       "SELECT * FROM submissions WHERE intern_id = $1",
//       [id]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching submissions" });
//   }
// });



// /*
//   PUT /api/submissions/review/:id
// */
// router.put("/review/:id", async (req, res) => {
//   const { id } = req.params;
//   const { status, feedback } = req.body;

//   try {
//     const result = await pool.query(
//       `UPDATE submissions
//        SET status = $1,
//            feedback = $2
//        WHERE id = $3
//        RETURNING *`,
//       [status, feedback, id]
//     );

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error reviewing submission" });
//   }
// });


// /*
//   PUT /api/submissions/approve/:projectId
// */
// router.put("/approve/:projectId", async (req, res) => {
//   const { projectId } = req.params;

//   try {
//     const result = await pool.query(
//       `UPDATE submissions
//        SET status = 'APPROVED'
//        WHERE project_id = $1
//        RETURNING *`,
//       [projectId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Submission not found" });
//     }

//     res.json({
//       message: "Submission approved successfully",
//       data: result.rows
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error updating status" });
//   }
// });
// export default router;



import express from "express";
import { pool } from "../config/db.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   GET ALL SUBMISSIONS (CEO ONLY)
========================= */
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "CEO") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      "SELECT * FROM submissions ORDER BY submitted_at DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

/* =========================
   GET SUBMISSIONS BY PROJECT
========================= */
router.get("/project/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM submissions WHERE project_id = $1",
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

/* =========================
   GET SUBMISSIONS BY INTERN
========================= */
router.get("/intern/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM submissions WHERE intern_id = $1",
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

export default router;
