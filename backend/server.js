import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/db.js";
import "./utils/deadlineReminder.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projectsRoutes.js";
import submissionRoutes from "./routes/submissionsRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import teamLeadRoutes from "./routes/teamLeadRoutes.js";
import ceoRoutes from "./routes/ceoRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/ceo", ceoRoutes)

app.use("/api/teamlead", teamLeadRoutes);
app.use("/api/intern", internRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
