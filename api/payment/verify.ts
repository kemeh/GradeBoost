import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gradeboost-df887", 
  });
}

const db = getFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

const getCampayToken = async () => {
  const username = process.env.CAMPAY_APP_USERNAME;
  const password = process.env.CAMPAY_APP_PASSWORD;
  const env = process.env.CAMPAY_ENVIRONMENT || 'dev';
  
  if (!username || !password) {
    console.warn("CamPay credentials not configured. Using mock payment gateway.");
    return { token: 'mock_token', baseUrl: 'mock' };
  }

  const baseUrl = env === 'dev' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
  
  try {
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
      throw new Error("Failed to authenticate with payment gateway");
    }

    return { token: tokenData.token, baseUrl };
  } catch (err) {
    console.error("Error getting CamPay token:", err);
    throw err;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference, userId } = req.body;
    
    const { token, baseUrl } = await getCampayToken();

    let status = 'PENDING';

    if (token === 'mock_token') {
      status = 'SUCCESSFUL';
    } else {
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
        console.error("Payment verify error response:", data);
      }
    }

    if (status === 'SUCCESSFUL' && userId) {
      await db.collection('users').doc(userId).update({
        paymentStatus: 'paid'
      });
    }

    res.json({ status });
  } catch (error) {
    console.error("Payment verify error:", error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
}
