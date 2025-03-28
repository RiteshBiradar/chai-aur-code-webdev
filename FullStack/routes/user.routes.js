import express from "express"
import { forgetPassword, getProfile, loginUser, logoutUser, registerUser, resetPassword, verifyUser } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/register",registerUser)
router.get("/verify/:token",verifyUser)
router.post("/login",loginUser)
router.get("/profile",isLoggedIn,getProfile)
router.get("/logout",isLoggedIn,logoutUser)
router.post("/forgotPass",forgetPassword)
router.post("/resetPass/:token",resetPassword)
export default router