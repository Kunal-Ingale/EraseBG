import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './Config/dbConnection.js';
import userRouter from './Routes/userRoutes.js';
import imageRouter from './Routes/imageRoutes.js'

const PORT = process.env.PORT || 4000;
const app = express()
app.use(express.json())
app.use(cors()); 
await connectDB()



app.get('/', (req,res)=>{
 res.send("Backend")
})

app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)

app.listen(PORT , ()=> console.log("server running on ",PORT))