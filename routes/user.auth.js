import express from "express";
import { createUser, loginUser, logoutUser } from "../controllers/user.authController.js";

const router = express.Router();

router.post("/create/user", createUser);

router.post("/login/user", loginUser);

router.post("/user/logout", logoutUser);

export default router;