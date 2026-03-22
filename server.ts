import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
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
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());
  app.use("/api/", apiLimiter);
  app.use("/api/payment/", paymentLimiter);

  // ... (keep existing API routes)

  // Duel Matching Logic
  const waitingQueue: { socketId: string, userId: string, subject: string }[] = [];
  const activeDuels = new Map<string, string>(); // userId -> duelId
  const socketToUser = new Map<string, string>(); // socketId -> userId

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinDuel", async ({ userId, subject }) => {
      console.log(`User ${userId} joined duel queue for ${subject}`);
      
      // Check if already in queue
      if (waitingQueue.find(p => p.userId === userId)) return;

      const opponent = waitingQueue.find(p => p.subject === subject);
      if (opponent) {
        // Match found
        waitingQueue.splice(waitingQueue.indexOf(opponent), 1);
        const duelId = crypto.randomUUID();
        
        // Fetch random questions
        const questionsSnapshot = await db.collection('exam_questions')
          .where('subject', '==', subject)
          .limit(20)
          .get();
        
        const allQuestions = questionsSnapshot.docs.map(doc => doc.id);
        const selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        // Create duel in Firestore
        await db.collection('duels').doc(duelId).set({
          player1Id: opponent.userId,
          player2Id: userId,
          questions: selectedQuestions,
          player1Score: 0,
          player2Score: 0,
          player1Time: 0,
          player2Time: 0,
          status: 'active',
          createdAt: FieldValue.serverTimestamp()
        });

        activeDuels.set(opponent.userId, duelId);
        activeDuels.set(userId, duelId);
        socketToUser.set(opponent.socketId, opponent.userId);
        socketToUser.set(socket.id, userId);

        io.to(opponent.socketId).emit("duelMatched", { duelId, opponentId: userId, questions: selectedQuestions });
        socket.emit("duelMatched", { duelId, opponentId: opponent.userId, questions: selectedQuestions });
      } else {
        waitingQueue.push({ socketId: socket.id, userId, subject });
        socketToUser.set(socket.id, userId);
      }
    });

    socket.on("submitAnswer", async ({ duelId, userId, score, timeTaken }) => {
      const duelRef = db.collection('duels').doc(duelId);
      const duelDoc = await duelRef.get();
      if (!duelDoc.exists) return;

      const duel = duelDoc.data()!;
      const isPlayer1 = duel.player1Id === userId;
      
      await duelRef.update({
        [isPlayer1 ? 'player1Score' : 'player2Score']: score,
        [isPlayer1 ? 'player1Time' : 'player2Time']: timeTaken
      });

      const updatedDuelDoc = await duelRef.get();
      const updatedDuel = updatedDuelDoc.data()!;

      // Check if both submitted
      if (updatedDuel.player1Score !== 0 && updatedDuel.player2Score !== 0) {
        // Calculate winner
        let winnerId = '';
        if (updatedDuel.player1Score > updatedDuel.player2Score) winnerId = updatedDuel.player1Id;
        else if (updatedDuel.player2Score > updatedDuel.player1Score) winnerId = updatedDuel.player2Id;
        else winnerId = updatedDuel.player1Time < updatedDuel.player2Time ? updatedDuel.player1Id : updatedDuel.player2Id;

        await duelRef.update({ winnerId, status: 'completed' });

        // Update leaderboard and pointsHistory
        const players = [updatedDuel.player1Id, updatedDuel.player2Id];
        for (const playerId of players) {
          const isWinner = playerId === winnerId;
          const points = isWinner ? 10 : 3; // Simplified scoring
          
          // Fetch user name for leaderboard
          const userDoc = await db.collection('users').doc(playerId).get();
          const userData = userDoc.data();
          const userName = userData?.name || userData?.firstName || 'Student';

          await db.collection('pointsHistory').add({
            userId: playerId,
            points,
            reason: isWinner ? 'Duel Win' : 'Duel Loss',
            timestamp: FieldValue.serverTimestamp()
          });
          
          const userRef = db.collection('leaderboard').doc(playerId);
          await userRef.set({
            name: userName,
            userId: playerId,
            points: FieldValue.increment(points),
            wins: FieldValue.increment(isWinner ? 1 : 0),
            losses: FieldValue.increment(isWinner ? 0 : 1),
            draws: FieldValue.increment(0),
            rank: 0 // Placeholder
          }, { merge: true });
        }
        
        io.to(duelId).emit("duelCompleted", { winnerId });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      
      // Remove from queue
      const queueIndex = waitingQueue.findIndex(p => p.socketId === socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      // Handle active duel disconnection
      const userId = socketToUser.get(socket.id);
      if (userId && activeDuels.has(userId)) {
        const duelId = activeDuels.get(userId)!;
        const duelRef = db.collection('duels').doc(duelId);
        const duelDoc = await duelRef.get();
        
        if (duelDoc.exists) {
          const duel = duelDoc.data()!;
          const opponentId = duel.player1Id === userId ? duel.player2Id : duel.player1Id;
          
          // Notify opponent
          io.to(duelId).emit("opponentDisconnected", { userId });
          
          // Mark duel as abandoned
          await duelRef.update({ status: 'abandoned', winnerId: opponentId });
          
          activeDuels.delete(duel.player1Id);
          activeDuels.delete(duel.player2Id);
        }
      }
      
      socketToUser.delete(socket.id);
    });
  });

  // ... (keep existing error handler and Vite middleware)

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
