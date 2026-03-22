import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const SOCKET_URL = window.location.origin;

interface Question {
  id: string;
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: string;
}

export default function DuelBattle() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched' | 'playing' | 'result'>('idle');
  const [duelId, setDuelId] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('duelMatched', async ({ duelId, opponentId, questions: questionIds }) => {
      setDuelId(duelId);
      setOpponentId(opponentId);
      
      // Fetch questions from Firestore
      const questionData: Question[] = [];
      for (const id of questionIds) {
        const qDoc = await getDoc(doc(db, 'exam_questions', id));
        if (qDoc.exists()) {
          questionData.push({ id: qDoc.id, ...qDoc.data() } as Question);
        }
      }
      setQuestions(questionData);
      setStatus('playing');
    });

    newSocket.on('duelCompleted', ({ winnerId }) => {
      setWinnerId(winnerId);
      setStatus('result');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startDuel = () => {
    if (!socket || !user) return;
    setStatus('searching');
    socket.emit('joinDuel', { userId: user.uid, subject: user.subject });
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Duel finished
      socket?.emit('submitAnswer', { duelId, userId: user?.uid, score: newScore, timeTaken: 0 }); // Simplified time
      setStatus('result');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Duel Battle</h1>
      {status === 'idle' && (
        <button onClick={startDuel} className="bg-blue-500 text-white p-4 rounded">Start Duel</button>
      )}
      {status === 'searching' && <p>Searching for opponent...</p>}
      {status === 'playing' && questions.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">{questions[currentQuestionIndex].questionText}</h2>
          {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
            <button key={key} onClick={() => handleAnswer(key)} className="block w-full bg-gray-200 p-4 mb-2 rounded">
              {value}
            </button>
          ))}
        </div>
      )}
      {status === 'result' && (
        <p className="text-2xl font-bold">
          {winnerId === user?.uid ? 'You Won!' : 'You Lost!'}
        </p>
      )}
    </div>
  );
}
