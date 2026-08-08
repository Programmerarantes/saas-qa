import { Router, Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { loginUser, registerUser } from "../services/authService";

export const authRouter = Router()

authRouter.post(
    "/register",
    validate(registerSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const user = await registerUser(req.body)
        res.status(201).json(user)
    })
)

authRouter.post(
    "/login",
    validate(loginSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = await loginUser(req.body)
        res.status(200).json(result)
    })
)
