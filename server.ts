import express from "express";
import { createServer } from "http";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gradeboost-df887", 
  });
}

const db = getAdminFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many payment attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// ... (keep existing helper functions)

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const PORT = 3000;

  app.use(express.json());
  app.use("/api/", apiLimiter);
  app.use("/api/payment/", paymentLimiter);

  // ... (keep existing API routes)

  // CamPay API Helper
  let cachedCampayToken: string | null = null;
  let tokenExpiryTime: number = 0;

  const getCampayToken = async () => {
    const username = process.env.CAMPAY_APP_USERNAME;
    const password = process.env.CAMPAY_APP_PASSWORD;
    const env = process.env.CAMPAY_ENVIRONMENT || 'DEMO';
    
    if (!username || !password) {
      console.warn("CamPay credentials not configured. Using mock payment gateway.");
      return { token: 'mock_token', baseUrl: 'mock' };
    }

    const isDemo = env.toUpperCase() === 'DEMO' || env.toUpperCase() === 'DEV';
    const baseUrl = isDemo ? 'https://demo.campay.net/api' : 'https://www.campay.net/api';
    
    // Use cached token if valid (assuming token lasts at least 1 hour, we cache for 50 minutes)
    if (cachedCampayToken && Date.now() < tokenExpiryTime) {
      return { token: cachedCampayToken, baseUrl };
    }

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

    cachedCampayToken = tokenData.token;
    tokenExpiryTime = Date.now() + (50 * 60 * 1000); // Cache for 50 minutes

    return { token: tokenData.token, baseUrl };
  };

  // New Payment Routes
  app.post("/api/pay", async (req, res) => {
    try {
      const { phone, amount, description, external_reference } = req.body;
      
      const { token, baseUrl } = await getCampayToken();

      if (token === 'mock_token') {
        return res.json({ reference: `mock_ref_${Date.now()}` });
      }

      const response = await fetch(`${baseUrl}/collect/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount,
          currency: "XAF",
          from: phone,
          description: description || "GradeBoost Payment",
          external_reference: external_reference
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Payment collect error response:", data);
        return res.status(response.status).json({ error: data.message || data || "Failed to initiate payment" });
      }

      res.json(data);
    } catch (error: any) {
      console.error("Payment collect error:", error.message);
      res.status(500).json({ error: "Payment failed" });
    }
  });

  app.get("/api/status", async (req, res) => {
    try {
      const reference = req.query.reference as string;
      const userId = req.query.userId as string;
      
      if (!reference) {
        return res.status(400).json({ error: "Reference is required" });
      }

      let token, baseUrl;
      try {
        const auth = await getCampayToken();
        token = auth.token;
        baseUrl = auth.baseUrl;
      } catch (tokenError: any) {
        console.error("Campay token error in status check:", tokenError.message);
        // Return PENDING so the frontend keeps polling
        return res.json({ status: 'PENDING' });
      }

      let status = 'PENDING';

      if (token === 'mock_token') {
        status = 'SUCCESSFUL';
      } else {
        let response;
        try {
          response = await fetch(`${baseUrl}/transaction/${reference}/`, {
            method: "GET",
            headers: {
              "Authorization": `Token ${token}`,
              "Content-Type": "application/json"
            }
          });
        } catch (fetchError: any) {
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
        } catch (dbError: any) {
          console.error("Backend Firestore update failed:", dbError.message);
          // Don't throw here, let the frontend handle the update if backend fails
        }
      }

      res.json({ status });
    } catch (error: any) {
      console.error("Payment status error:", error.message);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  app.post("/api/security/audit", (req, res) => {
    const { errorInfo } = req.body;
    console.warn("SECURITY AUDIT LOG:", JSON.stringify(errorInfo, null, 2));
    // In a real app, this would be written to a secure audit log or alerting system
    res.status(200).json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
