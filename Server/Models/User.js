import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId:{ type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    creditBalance: { type: Number, default: 3 },

})

const User =  mongoose.model("user", userSchema)
export default User;