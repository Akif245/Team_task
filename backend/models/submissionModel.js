import pool from "../db.js";

export const createSubmission = async (
  projectId,
  internId,
  title,
  description,
  filePath
) => {
  return await pool.query(
    `INSERT INTO submissions
    (project_id, intern_id, title, description, file_path)
    VALUES ($1,$2,$3,$4,$5)`,
    [projectId, internId, title, description, filePath]
  );
};

export const reviewSubmission = async (id, status, feedback) => {
  return await pool.query(
    `UPDATE submissions SET status=$1, feedback=$2 WHERE id=$3`,
    [status, feedback, id]
  );
};
