import { Webhook } from "svix";
import User from "../Models/User.js";


const clerkWebhooks = async (req, res) => {
    console.log("Webhook received:", req.body);

    try {
       
        // Initialize webhook with secret
        const wHook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await wHook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });
        console.log("Webhook verified successfully.");

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url,
                };
                await User.create(userData);
                console.log("User created:", userData);
                res.json({ success: true, message: "User created", user: userData });
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url,
                };
                const updatedUser = await User.findOneAndUpdate({ clerkId: data.id }, userData, { new: true });
                console.log("User updated:", updatedUser);
                res.json({ success: true, message: "User updated", user: updatedUser });
                break;
            }

            case "user.deleted": {
                console.log("Received Clerk ID for deletion:", data.id);
                const deletedUser = await User.findOneAndDelete({ clerkId: data.id });
                console.log("User deleted:", deletedUser);
                res.json({ success: true, message: "User deleted", user: deletedUser });
                break;
            }

            default:
                console.log("Unhandled webhook type:", type);
                res.status(400).json({ success: false, message: "Unhandled webhook type" });
                break;
        }
    } catch (error) {
        console.error("Error processing webhook:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



const userCredits = async(req,res)=>{
   try {
    const {clerkId} = req.body;
    const userData = await User.findOne({clerkId});
    
    res.json({success:true, credits:userData.creditBalance})
   } catch (error) {
    console.error("Error processing webhook:", error.message);
   res.status(500).json({ success: false, message: error.message });
   }  
}



export { clerkWebhooks,userCredits };