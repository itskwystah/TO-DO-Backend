// libraries
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";

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
