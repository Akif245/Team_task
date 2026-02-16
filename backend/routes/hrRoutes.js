import express from "express";
import auth from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
 createIntern,
 assignIntern,
 reassignIntern,
 analytics
} from "../controllers/hrController.js";

const router = express.Router();

router.post("/intern", auth, authorizeRoles("hr"), createIntern);

router.put("/assign", auth, authorizeRoles("hr"), assignIntern);

router.put("/reassign", auth, authorizeRoles("hr"), reassignIntern);

router.get("/analytics", auth, authorizeRoles("hr"), analytics);

export default router;