import express from "express";
import userAuth from "../../middleware/auth.middleware.js";
import { userClick, userCollect, userReset } from "../../controllers/service/user.clickController.js";

const router = express.Router();

router.post("/click", userAuth, userClick);

router.post("/collect", userAuth, userCollect);

router.get("/reset", userAuth, userReset);

export default router;