
import { Router } from "express";
import {
    signUp,
    login,
    otpVerify,
    forgetPassword,
    resendOTP,
    userAccountDeletion,
    userLogout
} from "../controllers/auth.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/forget-password").post(forgetPassword);
router.route("/resend-otp").post(resendOTP);
router.route("/verify-otp").post(authentication, otpVerify);
router.route("/logout").get(authentication, userLogout);
router.route("/delete-user").delete(authentication, userAccountDeletion);

export default router;