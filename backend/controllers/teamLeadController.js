import { createProject } from "../models/projectModel.js";
import { reviewSubmission } from "../models/submissionModel.js";

export const createNewProject = async (req, res) => {
  const { title, description, intern_id, deadline } = req.body;

  await createProject(
    title,
    description,
    intern_id,
    req.user.id,
    deadline
  );

  res.json({ message: "Project created successfully" });
};

export const reviewWork = async (req, res) => {
  const { status, feedback } = req.body;

  await reviewSubmission(req.params.id, status, feedback);

  res.json({ message: "Submission reviewed" });
};
