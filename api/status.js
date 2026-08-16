import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "edulpha-app", 
  });
}

const db = getAdminFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

let cachedCampayToken = null;
let tokenExpiryTime = 0;

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
      
      let token = cachedCampayToken;

      // 1. Get Token if not cached or expired
      if (!token || Date.now() >= tokenExpiryTime) {
        let tokenRes;
        try {
          tokenRes = await fetch(`${baseUrl}/token/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: username,
              password: password
            })
          });
        } catch (fetchError) {
          console.error("Campay token fetch error:", fetchError.message);
          return res.json({ status: 'PENDING' });
        }

        let tokenData;
        try {
          tokenData = await tokenRes.json();
        } catch (parseError) {
          console.error("Failed to parse Campay token response:", await tokenRes.text().catch(() => ''));
          return res.json({ status: 'PENDING' });
        }

        if (!tokenRes.ok) {
          console.error("CamPay token error:", tokenData);
          return res.json({ status: 'PENDING' });
        }

        token = tokenData.token;
        cachedCampayToken = token;
        tokenExpiryTime = Date.now() + (50 * 60 * 1000); // Cache for 50 minutes
      }

      // 2. Check Status
      let response;
      try {
        response = await fetch(`${baseUrl}/transaction/${reference}/`, {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (fetchError) {
        console.error("Campay fetch error:", fetchError.message);
        // Return PENDING so the frontend keeps polling
        return res.json({ status: 'PENDING' });
      }
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse Campay status response:", await response.text().catch(() => ''));
        data = null;
      }

      if (response.ok && data) {
        status = data.status;
      } else {
        console.error("Payment status error response:", data || response.statusText);
      }
    }

    if (status === 'SUCCESSFUL' && userId) {
      // Update user status in Firestore securely from backend
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year access
      
      try {
        await db.collection('users').doc(userId).update({
          paymentStatus: 'paid',
          isPaid: true,
          paymentDate: new Date().toISOString(),
          paymentExpiryDate: expiryDate.toISOString(),
          paid: true,
          paidAt: new Date().toISOString(),
          paymentReference: reference
        });
      } catch (dbError) {
        console.error("Backend Firestore update failed:", dbError.message);
        // Don't throw here, let the frontend handle the update if backend fails
      }
    }

    res.json({ status });
  } catch (error) {
    console.error("Payment status error:", error.message);
    res.status(500).json({ error: "Failed to check payment status" });
  }
}
