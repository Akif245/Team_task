import pool from "../db.js";

export const createProject = async (
  title,
  description,
  internId,
  teamLeadId,
  deadline
) => {
  return await pool.query(
    `INSERT INTO projects 
    (title, description, assigned_intern, assigned_team_lead, deadline)
    VALUES ($1,$2,$3,$4,$5)`,
    [title, description, internId, teamLeadId, deadline]
  );
};

export const getProjectsByIntern = async (internId) => {
  return await pool.query(
    "SELECT * FROM projects WHERE assigned_intern=$1",
    [internId]
  );
};
