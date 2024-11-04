import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import connectDB from './Config/dbConnection.js';
import userRouter from './Routes/userRoutes.js';
import imageRouter from './Routes/imageRoutes.js'

const PORT = process.env.PORT || 4000;
const app = express()
app.use(express.json({ limit: '10mb' }));

const allowedOrigins = ['https://erase-bg-xyz.vercel.app']; // Add your frontend URL here
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add any other methods you use
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you need to allow credentials (like cookies)
}));
await connectDB()

app.get('/', (req,res)=>{
 res.send("Backend")
})

app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.listen(PORT , ()=> console.log("server running on ",PORT))