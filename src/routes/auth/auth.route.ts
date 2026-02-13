import { login, logOut, reg } from "@/controllers/auth/auth.controller"
import { Router } from "express";

export const authRoute = Router();

authRoute.post("/register", reg);
authRoute.post("/login", login)
authRoute.post("/logout", logOut)