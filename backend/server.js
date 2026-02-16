import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import submissionRoutes from "./routes/submissions.js";
import hrRoutes from "./routes/hrRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/hr", hrRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
