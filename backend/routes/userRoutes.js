// import express from "express";
// import {pool} from "../config/db.js";

// const router = express.Router();

// /* CREATE USER */
// router.post("/create", async (req, res) => {
//   const { name, email, role, team_lead_id } = req.body;

//   try {
//     const result = await pool.query(
//       `INSERT INTO public.users (name, email, role, team_lead_id)
//        VALUES ($1, $2, $3, $4)
//        RETURNING *`,
//       [name, email, role, team_lead_id || null]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating user" });
//   }
// });

// /* GET ALL USERS */
// router.get("/all", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM public.users");
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching users" });
//   }
// });
// router.put("/assign-teamlead", async (req, res) => {
//   const { intern_id, team_lead_id } = req.body;

//   try {
//     await pool.query(
//       "UPDATE public.users SET team_lead_id = $1 WHERE id = $2",
//       [team_lead_id, intern_id]
//     );

//     res.json({ message: "Intern assigned successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error assigning team lead" });
//   }
// });

// /*
//   POST /api/users/assign-teamlead
// */
// router.post("/assign-teamlead", async (req, res) => {
//   const { intern_id, team_lead_id } = req.body;

//   try {
//     // Check if intern exists
//     const intern = await pool.query(
//       "SELECT * FROM users WHERE id = $1 AND role = 'INTERN'",
//       [intern_id]
//     );

//     if (intern.rows.length === 0) {
//       return res.status(404).json({ message: "Intern not found" });
//     }

//     // Check if team lead exists
//     const teamLead = await pool.query(
//       "SELECT * FROM users WHERE id = $1 AND role = 'TEAM_LEAD'",
//       [team_lead_id]
//     );

//     if (teamLead.rows.length === 0) {
//       return res.status(404).json({ message: "Team Lead not found" });
//     }

//     // Assign team lead
//     await pool.query(
//       "UPDATE users SET team_lead_id = $1 WHERE id = $2",
//       [team_lead_id, intern_id]
//     );

//     res.json({ message: "Intern assigned to Team Lead successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error assigning team lead" });
//   }
// });


// router.post("/create-bulk", async (req, res) => {
//   const users = req.body; // array of users

//   try {
//     for (const user of users) {
//       await pool.query(
//         "INSERT INTO users (name, email, role) VALUES ($1, $2, $3)",
//         [user.name, user.email, user.role]
//       );
//     }

//     res.status(201).json({ message: "Users created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating users" });
//   }
// });



// export default router;
import express from "express";
import { pool } from "../config/db.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   GET ALL USERS (CEO & HR)
========================= */
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "CEO" && req.user.role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      "SELECT id,name,email,role,team_lead_id FROM users ORDER BY id"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
