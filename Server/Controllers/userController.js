import { Webhook } from "svix";
import User from "../Models/User.js";
import stripe from "stripe";
import Transactions from '../Models/Transactions.js'

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

const clerkWebhooks = async (req, res) => {
  

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

const paymentStripe = async (req, res)=>{
    try {
        const {clerkId , planId} = req.body;
        const {origin} = req.headers;

        const userData = await User.findOne({ clerkId })
        if (!userData || !planId) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

        let credits, plan, amount, date;
        switch(planId){
            case 'Basic':{
                plan = 'Basic'
                credits = 100
                amount = 10
                break;
            }
            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
                break;

            case 'Business':
                plan = 'Basic'
                credits = 5000
                amount = 250
                break;

            default:
                return res.json({ success: false, message: 'plan not found' })
        }

        date = Date.now()

        const transactionData = {
            clerkId,
            plan,
            amount,
            credits,
            date
        } 
        const newTransaction = await Transactions.create(transactionData)
        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Credit Purchase"
                },
                unit_amount: transactionData.amount * 100
            },
            quantity: 1
        }]
         
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&transactionId=${newTransaction._id}`,
            cancel_url: `${origin}/verify?success=false&transactionId=${newTransaction._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { transactionId, success } = req.body

        // Checking for payment status
        if (success === 'true') {
            const transactionData = await Transactions.findById(transactionId)
            if (transactionData.payment) {
                return res.json({ success: false, message: 'Payment Already Verified' })
            }

            // Adding Credits in user data
            const userData = await User.findOne({ clerkId: transactionData.clerkId })
            const creditBalance = userData.creditBalance + transactionData.credits
            await User.findByIdAndUpdate(userData._id, { creditBalance })

            // Marking the payment true 
            await Transactions.findByIdAndUpdate(transactionData._id, { payment: true })

            res.json({ success: true, message: "Credits Added" });
        }
        else {
            res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export { clerkWebhooks,userCredits, paymentStripe, verifyStripe };