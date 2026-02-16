import { getProjectsByIntern } from "../models/projectModel.js";
import { createSubmission } from "../models/submissionModel.js";

export const getMyProjects = async (req, res) => {
  const result = await getProjectsByIntern(req.user.id);
  res.json(result.rows);
};

export const submitWork = async (req, res) => {
  const { project_id, title, description } = req.body;

  await createSubmission(
    project_id,
    req.user.id,
    title,
    description,
    req.file.path
  );

  res.json({ message: "Submission uploaded", status: "PENDING" });
};
