import bcrypt from "bcryptjs";
import {pool} from "../config/db.js";



// CREATE INTERN
export const createIntern = async (req, res) => {
 try {

  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
   "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
   [name, email, hash, "intern"]
  );

  res.json("Intern created");

 } catch (err) {
  res.status(500).json(err.message);
 }
};


// ASSIGN INTERN → TEAM LEAD
export const assignIntern = async (req, res) => {
 try {

  const { internId, teamLeadId } = req.body;

  await pool.query(
   "UPDATE users SET team_lead_id=$1 WHERE id=$2",
   [teamLeadId, internId]
  );

  res.json("Assigned successfully");

 } catch (err) {
  res.status(500).json(err.message);
 }
};


// REASSIGN INTERN
export const reassignIntern = async (req, res) => {
 try {

  const { internId, newTeamLeadId } = req.body;

  await pool.query(
   "UPDATE users SET team_lead_id=$1 WHERE id=$2",
   [newTeamLeadId, internId]
  );

  res.json("Team lead changed");

 } catch (err) {
  res.status(500).json(err.message);
 }
};


// HR ANALYTICS
export const analytics = async (req, res) => {
 try {

  const result = await pool.query(`
   SELECT 
     i.name AS intern,
     t.name AS teamlead,
     r.attendance,
     r.tasks_completed,
     r.remarks,
     r.created_at
   FROM reports r
   JOIN users i ON r.intern_id=i.id
   LEFT JOIN users t ON r.team_lead_id=t.id
   ORDER BY r.created_at DESC
  `);

  res.json(result.rows);

 } catch (err) {
  res.status(500).json(err.message);
 }
};