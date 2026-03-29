import express from "express";
import userAuth from "../middleware/auth.middleware.js";
import { getDashboard, getProfile, updateUser, updateWithdrawalDetails } from "../controllers/user.Controller.js";

const router = express.Router();

router.get("/user/dashboard", userAuth, getDashboard);

router.get("/user/profile", userAuth, getProfile);

router.put("/update/user", userAuth, updateUser);

router.put("/user/withdrawal", userAuth, updateWithdrawalDetails);


export default router;