import mongoose from "mongoose";

const connectDB = async()=>{
    mongoose.connection.on('connected', () => {
        console.log("DB connected");
    });
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
        console.error("Connection error:", error);
    }
}

export default connectDB