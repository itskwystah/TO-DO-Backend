// libraries
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
//import crypto from "crypto";

// Models
import Account from "@/models/account/account.model";

// Services
import {
  findAcctS,
  pushSessionS,
  regS,
} from "@/services/account/account.service";

// Utils
import { compareHashed, hashValue } from "@/utils/bcrypt/bcrypt.util";
import {
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
} from "@/utils/cookie/cookie.util";
import { AppError } from "@/utils/error/app-error.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt/jwt.util";
import { buildSession } from "@/utils/session/session.util";
import { sendEmail } from "@/utils/mailer/mail";
import { sendForgotPasswordOtpEmail } from "@/utils/mailer/scheduleConfirmationEmail";

// Register account
export const reg = async (req: Request, res: Response) => {
  // Get the data from request body
  const { name, email, password, confirmPassword } = req.body;

  // Validate required fields
  if (!name || !email || !password || !confirmPassword) {
    throw new AppError("All field are required.", 400);
  }

  // Confirm password match
  if (password !== confirmPassword) {
    throw new AppError("Password and Confirm Password do not match.", 400);
  }

  // Check existing email
  const existing = await findAcctS({ email });
  if (existing) {
    throw new AppError("Email already exist.", 409);
  }

  // Hash password
  const hashedPass = await hashValue(password);

  // Create account
  const account = await regS({
    name,
    email,
    password: hashedPass,
  } as any);

  if (!account) {
    throw new AppError("Failed to create account.", 500);
  }

  // Generate session id
  const sid = uuid();

  // Generate tokens
  const sub = String(account._id);
  const accessToken = signAccessToken(sub);
  const refreshToken = signRefreshToken(sub, sid);

  // Build session and save to db
  const session = await buildSession(req, refreshToken, sid);

  // Push the session to db
  const updated = await pushSessionS(sub, session);
  if (!updated) throw new AppError("Account not found.", 404);

  // Set the refresh token in cookie
  setRefreshCookie(res, refreshToken);

  // Send response
  return res.status(200).json({
    message: "Account registered successfully.",
    accessToken,
  });
};

// Login account
export const login = async (req: Request, res: Response) => {
  // Get the data from request body
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new AppError("All field are required.", 400);
  }

  // Find account
  const account = await findAcctS({ email });
  if (!account) {
    throw new AppError("Account not found.", 400);
  }

  // Verify password
  const ok = await compareHashed(password, account.password);
  if (!ok) {
    throw new AppError("Incorrect password.", 400);
  }

  // Generate session id
  const sid = uuid();

  // Generate tokens
  const sub = String(account._id);
  const accessToken = signAccessToken(sub);
  const refreshToken = signRefreshToken(sub, sid);

  // Build session
  const session = await buildSession(req, refreshToken, sid);

  // Save session
  const updated = await pushSessionS(sub, session);
  if (!updated) throw new AppError("Account not found.", 404);

  // Store refresh token cookie
  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    message: "Login successfully.",
    accessToken,
  });
};

// Logout account
export const logOut = async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  // remove session if token exists
  if (token) {
    try {
      const payload = verifyRefreshToken(token) as {
        sub: string;
        sid: string;
      };

      await Account.updateOne(
        { _id: payload.sub },
        { $pull: { sessions: { sid: payload.sid } } },
      );
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Logout verify failed:", err);
      }
    }
  }

  // clear the refresh token cookie
  clearRefreshCookie(res);

  // Send response
  return res.status(200).json({
    message: "Logged out successfully.",
  });
};

// Send Otp for forgot password
export const sendForgotPasswordOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required.", 400);
  }

  const account = await findAcctS({ email });
  if (!account) {
    throw new AppError("Account not found.", 404);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before saving
  const hashedOtp = await hashValue(otp);

  // Expire in 10 minutes
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await Account.updateOne(
    { _id: account._id },
    {
      forgotOtp: hashedOtp,
      forgotOtpExpires: expires,
    },
  );

  await sendForgotPasswordOtpEmail(email, otp);

  return res.status(200).json({
    message: "OTP sent successfully.",
  });
};

// Resend OTP
export const resendForgotPasswordOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required.", 400);
  }

  const account = await findAcctS({ email });
  if (!account) {
    throw new AppError("Account not found.", 404);
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await hashValue(otp);
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await Account.updateOne(
    { _id: account._id },
    {
      forgotOtp: hashedOtp,
      forgotOtpExpires: expires,
    },
  );

 await sendForgotPasswordOtpEmail(email, otp);

  return res.status(200).json({
    message: "OTP resent successfully.",
  });
};

// Verify OTP
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required.", 400);
  }

  const account = await findAcctS({ email });
  if (!account || !account.forgotOtp || !account.forgotOtpExpires) {
    throw new AppError("Invalid request.", 400);
  }

  if (account.forgotOtpExpires < new Date()) {
    throw new AppError("OTP expired.", 400);
  }

  const isMatch = await compareHashed(otp, account.forgotOtp);
  if (!isMatch) {
    throw new AppError("Invalid OTP.", 400);
  }

  return res.status(200).json({
    message: "OTP verified successfully.",
  });
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    throw new AppError("All fields are required.", 400);

  const account = await findAcctS({ email });
  if (!account || !account.forgotOtp || !account.forgotOtpExpires)
    throw new AppError("Invalid request.", 400);
  if (account.forgotOtpExpires < new Date())
    throw new AppError("OTP expired.", 400);

  const isMatch = await compareHashed(otp, account.forgotOtp);
  if (!isMatch) throw new AppError("Invalid OTP.", 400);

  const hashedPass = await hashValue(newPassword);

  // Clear OTP and old sessions
  await Account.updateOne(
    { _id: account._id },
    {
      password: hashedPass,
      forgotOtp: null,
      forgotOtpExpires: null,
      sessions: [],
    },
  );

  // Auto-login
  const sid = uuid();
  const sub = String(account._id);
  const accessToken = signAccessToken(sub);
  const refreshToken = signRefreshToken(sub, sid);

  const session = await buildSession(req, refreshToken, sid);
  await pushSessionS(sub, session);

  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    message: "Password reset successfully.",
    accessToken,
  });
};
