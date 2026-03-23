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

  // Payment Routes (Manual only now)
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
