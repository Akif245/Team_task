import pool from "../db.js";

export const assignTeamLead = async (internId, teamLeadId) => {
  return await pool.query(
    "UPDATE users SET team_lead_id=$1 WHERE id=$2",
    [teamLeadId, internId]
  );
};
