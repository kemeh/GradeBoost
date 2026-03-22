import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import rateLimit from "express-rate-limit";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gradeboost-df887", 
  });
}

const db = getAdminFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

const CAMPAY_BASE_URL = process.env.CAMPAY_ENVIRONMENT === 'prod' 
  ? 'https://www.campay.net/api' 
  : 'https://www.campay.net/api'; 

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment attempts, please try again later." }
});

async function getCampayToken() {
  if (!process.env.CAMPAY_APP_USERNAME || !process.env.CAMPAY_APP_PASSWORD) {
    throw new Error("CamPay credentials missing in environment variables.");
  }

  try {
    const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
      username: process.env.CAMPAY_APP_USERNAME,
      password: process.env.CAMPAY_APP_PASSWORD
    });
    return response.data.token;
  } catch (error: any) {
    console.error("CamPay Token Error:", error.response?.data || error.message);
    throw new Error(`Failed to authenticate with CamPay: ${error.response?.data?.error || error.message}`);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/api/", apiLimiter);
  app.use("/api/payment/", paymentLimiter);

  // CamPay API Routes
  app.post("/api/payment/collect", async (req, res, next) => {
    let { phone, amount, description, external_reference } = req.body;
    
    try {
      console.log(`Initiating payment for ${phone}, amount: ${amount}`);
      
      // Ensure phone number has country code (237 for Cameroon)
      if (phone && phone.length === 9 && (phone.startsWith('6') || phone.startsWith('2'))) {
        phone = `237${phone}`;
      } else if (phone && phone.length === 8 && (phone.startsWith('6') || phone.startsWith('2'))) {
        // Some old numbers are 8 digits
        phone = `237${phone}`;
      }

      // Fetch dynamic price from Firestore to ensure security
      let finalAmount = amount;
      try {
        const settingsDoc = await db.collection('system_settings').doc('global').get();
        if (settingsDoc.exists) {
          const settings = settingsDoc.data();
          if (settings?.paymentPrice) {
            finalAmount = settings.paymentPrice;
            console.log(`Using dynamic price from Firestore: ${finalAmount}`);
          }
        } else {
          console.warn("System settings document 'global' not found. Using client-provided amount.");
        }
      } catch (err) {
        console.error("Error fetching dynamic price in server:", err);
        // Fallback to the amount sent from client if fetching fails
      }

      const token = await getCampayToken();
      console.log("CamPay token obtained successfully.");

      const response = await axios.post(`${CAMPAY_BASE_URL}/collect/`, {
        amount: String(finalAmount),
        currency: "XAF",
        from: phone,
        description,
        external_reference
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      console.log("CamPay response:", response.data);
      res.json(response.data);
    } catch (error: any) {
      console.error("Payment Collection Error:", error.response?.data || error.message);
      next(error);
    }
  });

  app.get("/api/payment/status/:reference", async (req, res) => {
    const { reference } = req.params;
    
    try {
      const token = await getCampayToken();
      const response = await axios.get(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      res.json(response.data);
    } catch (error: any) {
      console.error("CamPay Status Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  // SECURE Payment Verification Endpoint
  app.post("/api/payment/verify", async (req, res) => {
    const { reference, userId } = req.body;

    if (!reference || !userId) {
      return res.status(400).json({ error: "Missing reference or userId" });
    }

    try {
      const token = await getCampayToken();
      const response = await axios.get(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });

      const paymentData = response.data;

      if (paymentData.status === 'SUCCESSFUL') {
        const userRef = db.collection('users').doc(userId);
        const now = new Date();
        const expiry = new Date(now);
        expiry.setDate(now.getDate() + 30);

        // Update user status securely from server
        await userRef.update({
          paymentStatus: 'paid',
          paymentDate: now.toISOString(),
          paymentExpiryDate: expiry.toISOString(),
          updatedAt: FieldValue.serverTimestamp()
        });

        // Log the audit
        await db.collection('paymentAudit').add({
          userId,
          reference,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          timestamp: FieldValue.serverTimestamp(),
          external_reference: paymentData.external_reference
        });

        res.json({ status: 'SUCCESSFUL', message: "Payment verified and account updated" });
      } else {
        res.json({ status: paymentData.status, message: "Payment not successful yet" });
      }
    } catch (error: any) {
      console.error("Payment Verification Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/security/audit", async (req, res) => {
    const { errorInfo } = req.body;

    if (!errorInfo) {
      return res.status(400).json({ error: "Missing errorInfo" });
    }

    try {
      await db.collection('securityAudit').add({
        ...errorInfo,
        timestamp: FieldValue.serverTimestamp(),
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Security Audit Error:", error);
      res.status(500).json({ error: "Failed to log security audit" });
    }
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err);
    
    let status = err.status || 500;
    let message = err.message || "Internal Server Error";

    // Handle Axios errors
    if (axios.isAxiosError(err)) {
      status = err.response?.status || 500;
      message = err.response?.data?.error || err.response?.data?.message || err.message;
    }

    res.status(status).json({
      error: message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
