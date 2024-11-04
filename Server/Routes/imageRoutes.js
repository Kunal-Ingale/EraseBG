import express from 'express'
import { removeBgImage } from '../Controllers/imageController.js'
import upload from '../Middlewares/multer.js'
import authUser from '../Middlewares/auth.js'

const imageRouter = express.Router();

imageRouter.post('/remove-bg' , upload.single('image'),authUser, removeBgImage)

export default imageRouter

//the checkout session's total amount must convert to at least 50 cents Rs.10 converts to approx $0.12