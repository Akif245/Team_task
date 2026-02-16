import express from "express";
import {pool} from "../config/db.js";

const router = express.Router();

/*
  POST /api/projects/create
*/
router.post("/create", async (req, res) => {
  const { title, description, intern_id, deadline } = req.body;

  try {
    // 1️⃣ Get team_lead_id of that intern
    const intern = await pool.query(
      "SELECT team_lead_id FROM users WHERE id = $1",
      [intern_id]
    );

    if (intern.rows.length === 0) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const team_lead_id = intern.rows[0].team_lead_id;

    // 2️⃣ Insert project with team_lead_id
    const result = await pool.query(
      `INSERT INTO projects 
       (title, description, intern_id, team_lead_id, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, intern_id, team_lead_id, deadline]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating project" });
  }
});

/*
  GET /api/projects/teamlead/:id
*/
router.get("/teamlead/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM projects WHERE team_lead_id = $1",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching team lead projects" });
  }
});


/*
  GET /api/projects/all
*/
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching projects" });
  }
});



/*
  GET /api/projects/intern/:id
*/
router.get("/intern/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE intern_id = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching projects" });
  }
});

/*
  GET /api/projects
*/
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY id"
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching projects" });
  }
});



export default router;