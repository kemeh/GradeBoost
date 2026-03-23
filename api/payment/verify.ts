import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gradeboost-df887", 
  });
}

const db = getFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

const getCampayAuth = () => {
  const username = process.env.CAMPAY_APP_USERNAME;
  const password = process.env.CAMPAY_APP_PASSWORD;
  const env = process.env.CAMPAY_ENVIRONMENT || 'dev';
  
  if (!username || !password) {
    console.warn("CamPay credentials not configured. Using mock payment gateway.");
    return { authHeader: 'mock_token', baseUrl: 'mock' };
  }

  const baseUrl = env === 'dev' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  return { authHeader, baseUrl };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference, userId } = req.body;
    
    const { authHeader, baseUrl } = getCampayAuth();

    let status = 'PENDING';

    if (authHeader === 'mock_token') {
      status = 'SUCCESSFUL';
    } else {
      const response = await fetch(`${baseUrl}/transaction/${reference}/`, {
        method: "GET",
        headers: {
          "Authorization": authHeader,
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
