import { Webhook } from "svix";
import User from "../Models/User.js";
import stripe from "stripe";
import Transaction from '../Models/Transactions.js'

//  console.log(process.env.STRIPE_SECRET_KEY);

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


const userCredits = async (req, res) => {
    try {
        const {clerkId} = req.body;
        // console.log(clerkId);
        

        if (!clerkId) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required" 
            });
        }

        const userData = await User.findOne({ clerkId });
        if (!userData) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.json({ 
            success: true, 
            credits: userData.creditBalance 
        });
    } catch (error) {
        console.error("Error fetching user credits:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

 // Initialize Stripe

 const paymentStripe = async (req, res) => {
    try {

        const { clerkId, planId } = req.body
        const { origin } = req.headers

        const userData = await User.findOne({ clerkId })

        // checking for planId and userdata
        if (!userData || !planId) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

        let credits, plan, amount, date;
        switch (planId) {
            case 'Basic':
                plan = 'Basic';
                credits = 10;
                amount = 99;
                break;
            case 'Advanced':
                plan = 'Advanced';
                credits = 30;
                amount = 249;
                break;
            case 'Business':
                plan = 'Business';
                credits = 50;
                amount = 399;
                break;
            default:
                return res.json({ success: false, message: 'Plan not found' });
        }


        date = Date.now()

        // Creating Transaction Data
        const transactionData = {
            clerkId,
            plan,
            amount,
            credits,
            date
        }

        // Saving Transaction Data to Database
        const newTransaction = await Transaction.create(transactionData)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
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

// API Controller function to verify stripe payment
const verifyStripe = async (req, res) => {
    try {
        const { transactionId, success } = req.body;

        if (success === 'true') {
            const transactionData = await Transaction.findById(transactionId)
            
            
            if (transactionData.payment) {
                return res.json({ success: false, message: 'Payment Already Verified' })
            }

            // Adding Credits in user data
            const userData = await User.findOne({ clerkId: transactionData.clerkId })
            const creditBalance = userData.creditBalance + transactionData.credits
            await User.findByIdAndUpdate(userData._id, { creditBalance })
            // console.log(creditBalance);
            

            // Marking the payment true 
            await Transaction.findByIdAndUpdate(transactionData._id, { payment: true })

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