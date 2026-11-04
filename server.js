const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Make sure node-fetch is installed or use global fetch in Node 18+

const app = express();
app.use(express.json());
app.use(cors());

// Optima Pay Bridge Credentials provided
const OPTIMA_API_KEY = "2885a38bc1775051ec2317e973c7b62a60be3706d1535d51b5a30b59f2c2b1fc";
const OPTIMA_SECRET_KEY = "098b2151cf9c0725dda322784d938e0e9d60e34c88d9712a9e9ed27577305cb8";

// Optima Pay Bridge STK Push Endpoint Base (adjust if updated by your gateway provider)
const OPTIMA_ENDPOINT = "https://optimapaybridge.co.ke/api/v2/stk_push.php"; 

app.post('/pay', async (req, res) => {
    try {
        const { phone, amount, limit, name } = req.body;

        if (!phone || !amount) {
            return res.status(400).json({ success: false, message: "Missing required parameters (phone or amount)" });
        }

        // Payload structure for Optima Pay Bridge API request
        const payload = {
            phone: phone,          // Format: 2547XXXXXXXX
            amount: amount,        // Activation fee amount
            reference: "Fuliza Booster",
            description: `Activation fee for limit KSh ${limit}`,
            customer_name: name
        };

        // Call Optima Pay Gateway Bridge
        const optimaResponse = await fetch(OPTIMA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': OPTIMA_API_KEY,
                'X-API-SECRET': OPTIMA_SECRET_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await optimaResponse.json();

        if (optimaResponse.ok && (data.success === true || data.ResponseCode === "0")) {
            return res.status(200).json({
                success: true,
                message: "STK Push sent successfully",
                data: data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: data.message || "Failed to initiate STK push via gateway."
            });
        }

    } catch (error) {
        console.error("Server payment routing error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error connecting to payment gateway." 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Optima Bridge payment server running on port ${PORT}`);
});
