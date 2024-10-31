import express from "express";
import { clerkWebhooks, userCredits } from "../Controllers/userController.js";
import authUser from "../Middlewares/auth.js";

const userRouter = express.Router();

userRouter.post('/webhooks', clerkWebhooks);
userRouter.get('/credits',authUser,userCredits)

export default userRouter;