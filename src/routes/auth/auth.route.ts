import { login, logOut, reg, resendForgotPasswordOtp, resetPassword, sendForgotPasswordOtp, verifyForgotPasswordOtp } from "@/controllers/auth/auth.controller"
import { Router } from "express";

export const authRoute = Router();

authRoute.post("/register", reg);
authRoute.post("/login", login);
authRoute.post("/logout", logOut);

// OTP routes for forgot password
authRoute.post("/forgot-password/send-otp", sendForgotPasswordOtp); // send OTP
authRoute.post("/forgot-password/resend-otp", resendForgotPasswordOtp); // resend OTP
authRoute.post("/forgot-password/verify-otp", verifyForgotPasswordOtp); // verify OTP
authRoute.post("/forgot-password/reset", resetPassword); // reset password