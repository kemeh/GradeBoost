import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // This works in Cloud Run / AI Studio
  projectId: firebaseConfig.projectId,
});

const db = admin.firestore();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

import { initiateCollect, checkTransactionStatus } from "./campayService";

// --- API Routes ---

// Payment with CamPay
app.post("/api/payment/initiate", async (req: any, res) => {
  const { phoneNumber, amount } = req.body;
  const externalReference = `GB60_${Date.now()}`;

  try {
    const data = await initiateCollect(
      amount.toString(),
      phoneNumber,
      "GradeBoost 60 - Full Access",
      externalReference
    );

    // Record transaction in Firestore
    await db.collection("transactions").doc(data.reference).set({
      userId: req.headers['x-user-id'] || "unknown", // Pass userId in header from frontend
      reference: data.reference,
      externalReference,
      amount,
      status: 'PENDING',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      message: "Payment initiated", 
      reference: data.reference, 
      ussd_code: data.ussd_code 
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/payment/status/:reference", async (req: any, res) => {
  const { reference } = req.params;

  try {
    const data = await checkTransactionStatus(reference);
    const transactionRef = db.collection("transactions").doc(reference);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      await transactionRef.update({
        status: data.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      if (data.status === 'SUCCESSFUL') {
        const transactionData = transactionDoc.data();
        if (transactionData?.userId) {
          const userRef = db.collection("users").doc(transactionData.userId);
          await userRef.update({
            isPaid: true
          });
        }
      }
    }

    res.json({ status: data.status });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
