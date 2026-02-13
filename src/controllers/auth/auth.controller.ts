import { findAcctS, regS } from "@/services/auth/auth.service";
import { compareHashed, hashValue } from "@/utils/bcrypt/bcrypt";
import { AppError } from "@/utils/error/app-error.util";
import { Request, Response } from "express";

export const reg = async (req: Request, res: Response) => {
  // Get body data
  const { name, email, password } = req.body;

  // if (!name) throw new AppError("Name is required.", 400);
  // if (!email) throw new AppError("Email is required.", 400);
  // if (!password) throw new AppError("Password is required.", 400);

  // Check if fields have data
  if (!name || !email || !password)
    throw new AppError("All field are required.", 400);

  // Find existing email
  if (await findAcctS({ email })) {
    throw new AppError("Email already exist.", 409);
  }

  // Hashed password
  const hashedPass = await hashValue(password);

  // Create Account
  const account = await regS({
    name,
    email,
    password: hashedPass,
  });

  // Return response
  res
    .status(200)
    .json({ message: "Account registered successfully.", account });
};

export const login = async (req: Request, res: Response) => {
  // Get body data
  const { email, password } = req.body;

  //   if (!name) throw new AppError("Name is required.", 400);
  //   if (!email) throw new AppError("Email is required.", 400);
  //   if (!password) throw new AppError("Password is required.", 400);

  // Check if fields have data
  if (!email || !password) throw new AppError("All field are required.", 400);

  // Find account
  const account = await findAcctS({ email });

  if (!account) {
    throw new AppError("Account not found.", 400);
  }

  // Check password
  const passCorrect = await compareHashed(password, account.password);
  if (!passCorrect) {
    throw new AppError("Incorrect password.", 400);
  }

  // Return response
  res.status(200).json({ message: "Login successfully.", account });
};

// Logout Acct
export const logOut = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if data exist
  if (!email) throw new AppError("Email not exist.", 400);

  const acct = await findAcctS({ email });

  // Check if the email exist
  if (!acct) throw new AppError("User not found.", 404);

  // Return Response
  res.status(200).json({
    message: "Logout Successfully.",
    acct,
  });
};
