import { Router, Request, Response } from "express";
import { registerSchema } from "../schemas/auth.schema";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { registerUser } from "../services/authService";

export const authRouter = Router()

authRouter.post(
    "/register",
    validate(registerSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const user = await registerUser(req.body)
        res.status(201).json(user)
    })
)