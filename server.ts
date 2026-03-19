import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CAMPAY_BASE_URL = process.env.CAMPAY_ENVIRONMENT === 'prod' 
  ? 'https://www.campay.net/api' 
  : 'https://www.campay.net/api'; // Usually same for dev/prod, but check docs

async function getCampayToken() {
  const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
    username: process.env.CAMPAY_APP_USERNAME,
    password: process.env.CAMPAY_APP_PASSWORD
  });
  return response.data.token;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CamPay API Routes
  app.post("/api/payment/collect", async (req, res) => {
    const { phone, amount, description, external_reference } = req.body;
    
    try {
      const token = await getCampayToken();
      const response = await axios.post(`${CAMPAY_BASE_URL}/collect/`, {
        amount,
        currency: "XAF",
        from: phone,
        description,
        external_reference
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      res.json(response.data);
    } catch (error: any) {
      console.error("CamPay Collect Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to initiate payment" });
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
