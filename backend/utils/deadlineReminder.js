// import cron from "node-cron";
// import { pool } from "../config/db.js";
// import { createNotification } from "../utils/notificationService.js";

// // Runs every day at 9:00 AM
// cron.schedule("0 9 * * *", async () => {
//   try {
//     timezone: "Asia/Kolkata"

//     const tomorrowQuery = await pool.query(`
//   SELECT p.id, p.title, p.intern_id
//   FROM projects p
//   WHERE p.deadline = CURRENT_DATE + INTERVAL '1 day'
//   AND p.status = 'Ongoing'
//   AND NOT EXISTS (
//     SELECT 1 FROM notifications n
//     WHERE n.user_id = p.intern_id
//     AND n.type = 'DEADLINE_REMINDER'
//     AND DATE(n.created_at) = CURRENT_DATE
//   )
// `);


//     for (const project of tomorrowQuery.rows) {
//       await createNotification(
//         project.intern_id,
//         `Reminder: Your project "${project.title}" is due tomorrow.`,
//         "DEADLINE_REMINDER"
//       );
//     }

//     console.log("✅ Deadline Reminder Job Completed");

//   } catch (error) {
//     console.error("❌ Deadline Reminder Error:", error);
//   }
// });
import cron from "node-cron";
import { pool } from "../config/db.js";
import { createNotification } from "../utils/notificationService.js";

// Runs daily at 9 AM (India time)
cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      console.log("⏰ Running Deadline Reminder Job...");

      const result = await pool.query(`
        SELECT p.id, p.title, p.intern_id
        FROM projects p
        WHERE p.deadline::date = CURRENT_DATE + INTERVAL '1 day'
        AND p.status = 'Ongoing'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = p.intern_id
          AND n.type = 'DEADLINE_REMINDER'
          AND DATE(n.created_at) = CURRENT_DATE
        )
      `);

      for (const project of result.rows) {
        await createNotification(
          project.intern_id,
          `Reminder: Your project "${project.title}" is due tomorrow.`,
          "DEADLINE_REMINDER"
        );
      }

      console.log(`✅ Deadline Reminder Job Completed - ${result.rows.length} reminders sent`);

    } catch (error) {
      console.error("❌ Deadline Reminder Error:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
