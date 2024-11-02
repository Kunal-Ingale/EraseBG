import express from "express";
import { userCredits, clerkWebhooks, paymentStripe, verifyStripe } from '../Controllers/userController.js'
import authUser from "../Middlewares/auth.js";

const userRouter = express.Router();

userRouter.post('/webhooks', clerkWebhooks);
userRouter.get('/credits',authUser,userCredits)
userRouter.post("/pay-stripe", authUser, paymentStripe)
userRouter.post("/verify-stripe", authUser, verifyStripe)

export default userRouter;