import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gradeboost-df887", 
  });
}

const db = getAdminFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const reference = req.query.reference;
    const userId = req.query.userId;
    
    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    const username = process.env.CAMPAY_APP_USERNAME;
    const password = process.env.CAMPAY_APP_PASSWORD;
    const env = process.env.CAMPAY_ENVIRONMENT || 'DEMO';
    
    let status = 'PENDING';

    if (!username || !password) {
      console.warn("CamPay credentials not configured. Using mock payment gateway.");
      status = 'SUCCESSFUL';
    } else {
      const isDemo = env.toUpperCase() === 'DEMO' || env.toUpperCase() === 'DEV';
      const baseUrl = isDemo ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
      
      // 1. Get Token
      const tokenRes = await fetch(`${baseUrl}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        console.error("CamPay token error:", tokenData);
        return res.status(500).json({ error: "Failed to authenticate with payment gateway" });
      }

      const token = tokenData.token;

      // 2. Check Status
      const response = await fetch(`${baseUrl}/transaction/${reference}/`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        status = data.status;
      } else {
        console.error("Payment status error response:", data);
      }
    }

    if (status === 'SUCCESSFUL' && userId) {
      // Update user status in Firestore securely from backend
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year access
      
      await db.collection('users').doc(userId).update({
        paymentStatus: 'paid',
        isPaid: true,
        paymentDate: new Date().toISOString(),
        paymentExpiryDate: expiryDate.toISOString(),
        paid: true,
        paidAt: new Date().toISOString(),
        paymentReference: reference
      });
    }

    res.json({ status });
  } catch (error) {
    console.error("Payment status error:", error.message);
    res.status(500).json({ error: "Failed to check payment status" });
  }
}
