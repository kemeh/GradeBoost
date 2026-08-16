import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, onSnapshot, setDoc, updateDoc, serverTimestamp, getDocs, runTransaction } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Trophy, Users, Timer, Target, CheckCircle2, XCircle, Loader2, Sword, Shield, Crown, Lock, LayoutDashboard } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { LeaderboardEntry } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { toast } from 'react-hot-toast';

interface Question {
  id: string;
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: string;
}

export default function DuelBattle() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'searching' | 'playing' | 'result'>('idle');
  const [duelId, setDuelId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>('Opponent');
  const [opponentPhotoURL, setOpponentPhotoURL] = useState<string | null>(null);
  const [opponentScore, setOpponentScore] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeDuelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch Duel Leaderboard
    const leaderboardQuery = query(
      collection(db, 'leaderboard'),
      where('subject', '==', user.subject),
      orderBy('points', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(leaderboardQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() } as any as LeaderboardEntry));
      setLeaderboard(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (unsubscribeDuelRef.current) unsubscribeDuelRef.current();
      unsub();
    };
  }, [user]);

  const startDuel = async () => {
    if (!user) return;
    if (user.paymentStatus !== 'paid') {
      navigate('/payment');
      return;
    }
    setStatus('searching');
    setScore(0);
    setTimeTaken(0);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setWinnerId(null);
    setOpponentScore(null);

    try {
      // 1. Look for a waiting duel
      const waitingQuery = query(
        collection(db, 'duels'),
        where('subject', '==', user.subject),
        where('status', '==', 'waiting'),
        limit(1)
      );
      
      const waitingSnapshot = await getDocs(waitingQuery);
      
      let currentDuelId = '';

      if (!waitingSnapshot.empty) {
        // Join existing duel
        const duelDoc = waitingSnapshot.docs[0];
        currentDuelId = duelDoc.id;
        
        // Prevent joining our own duel if we somehow got stuck
        if (duelDoc.data().player1.uid !== user.uid) {
          await updateDoc(doc(db, 'duels', currentDuelId), {
            player2: {
              uid: user.uid,
              name: user.name || 'Student',
              photoURL: user.photoURL || null,
              score: 0,
              timeTaken: 0,
              finished: false
            },
            status: 'playing'
          });
        }
      } else {
        // Create new duel
        const newDuelRef = doc(collection(db, 'duels'));
        currentDuelId = newDuelRef.id;
        
        // Fetch 5 random questions
        const qQuery = query(
          collection(db, 'exam_questions'),
          where('subject', '==', user.subject),
          where('isDailyDrill', '==', false),
          limit(20)
        );
        const qSnapshot = await getDocs(qQuery);
        const allQ = qSnapshot.docs.map(d => d.id);
        const shuffled = allQ.sort(() => 0.5 - Math.random());
        const selectedQ = shuffled.slice(0, 5);

        await setDoc(newDuelRef, {
          subject: user.subject,
          status: 'waiting',
          player1: {
            uid: user.uid,
            name: user.name || 'Student',
            photoURL: user.photoURL || null,
            score: 0,
            timeTaken: 0,
            finished: false
          },
          player2: null,
          questions: selectedQ,
          winnerId: null,
          createdAt: serverTimestamp()
        });
      }

      setDuelId(currentDuelId);
      listenToDuel(currentDuelId);

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'duels');
      setStatus('idle');
      toast.error("Failed to find or create a duel.");
    }
  };

  const listenToDuel = (dId: string) => {
    if (unsubscribeDuelRef.current) {
      unsubscribeDuelRef.current();
    }

    unsubscribeDuelRef.current = onSnapshot(doc(db, 'duels', dId), async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();

      // Determine who is opponent
      const isPlayer1 = data.player1.uid === user?.uid;
      const opponent = isPlayer1 ? data.player2 : data.player1;

      if (opponent) {
        setOpponentName(opponent.name);
        setOpponentPhotoURL(opponent.photoURL);
        setOpponentScore(opponent.score);
      }

      if (data.status === 'playing' && status !== 'playing' && status !== 'result') {
        // Game started! Fetch questions
        const qData: Question[] = [];
        for (const qId of data.questions) {
          const qDoc = await getDoc(doc(db, 'exam_questions', qId));
          if (qDoc.exists()) {
            qData.push({ id: qDoc.id, ...qDoc.data() } as Question);
          }
        }
        setQuestions(qData);
        setStatus('playing');
        setTimeTaken(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeTaken(prev => prev + 1);
        }, 1000);
        toast.success(`Duel started against ${opponent?.name || 'Opponent'}!`);
      }

      if (data.status === 'finished' && status !== 'result') {
        setWinnerId(data.winnerId);
        setStatus('result');
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (data.winnerId === user?.uid) {
          toast.success('Duel completed! You won! 🎉');
        } else if (data.winnerId === 'draw') {
          toast.success('Duel completed! It\'s a draw!');
        } else {
          toast.error('Duel completed! You lost. 😢');
        }
        
        // Update leaderboard locally
        updateLeaderboard(data.winnerId);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'duels');
    });
  };

  const handleAnswer = async (answer: string) => {
    if (!user || !duelId) return;

    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('result'); // Wait for opponent

      try {
        const duelRef = doc(db, 'duels', duelId);
        
        await runTransaction(db, async (transaction) => {
          const duelDoc = await transaction.get(duelRef);
          if (!duelDoc.exists()) return;
          
          const data = duelDoc.data();
          const isPlayer1 = data.player1.uid === user.uid;
          
          const myKey = isPlayer1 ? 'player1' : 'player2';
          const oppKey = isPlayer1 ? 'player2' : 'player1';
          
          const myData = { ...data[myKey], score: newScore, timeTaken, finished: true };
          const oppData = data[oppKey];

          const updates: any = {
            [myKey]: myData
          };

          if (oppData && oppData.finished) {
            // Both finished, determine winner
            updates.status = 'finished';
            if (myData.score > oppData.score) {
              updates.winnerId = myData.uid;
            } else if (oppData.score > myData.score) {
              updates.winnerId = oppData.uid;
            } else {
              // Tie breaker by time
              if (myData.timeTaken < oppData.timeTaken) {
                updates.winnerId = myData.uid;
              } else if (oppData.timeTaken < myData.timeTaken) {
                updates.winnerId = oppData.uid;
              } else {
                updates.winnerId = 'draw';
              }
            }
          }

          transaction.update(duelRef, updates);
        });

      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'duels');
      }
    }
  };

  const updateLeaderboard = async (wId: string | null) => {
    if (!user) return;
    try {
      const lbRef = doc(db, 'leaderboard', user.uid);
      const lbDoc = await getDoc(lbRef);
      
      let pointsToAdd = 3; // Participation
      let wins = 0;
      let losses = 0;
      let draws = 0;

      if (wId === user.uid) {
        pointsToAdd = 10;
        wins = 1;
      } else if (wId === 'draw') {
        pointsToAdd = 5;
        draws = 1;
      } else if (wId) {
        losses = 1;
      }

      if (lbDoc.exists()) {
        const data = lbDoc.data();
        await updateDoc(lbRef, {
          points: (data.points || 0) + pointsToAdd,
          wins: (data.wins || 0) + wins,
          losses: (data.losses || 0) + losses,
          draws: (data.draws || 0) + draws,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(lbRef, {
          userId: user.uid,
          name: user.name || 'Student',
          subject: user.subject,
          points: pointsToAdd,
          wins,
          losses,
          draws,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating leaderboard", error);
    }
  };

  const cancelSearch = async () => {
    if (duelId) {
      try {
        await updateDoc(doc(db, 'duels', duelId), { status: 'finished' });
      } catch (e) {
        // Ignore
      }
    }
    setStatus('idle');
    if (unsubscribeDuelRef.current) unsubscribeDuelRef.current();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                title="Go to Dashboard"
              >
                <LayoutDashboard size={20} />
              </Button>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Duel Battle</h1>
                <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Real-time academic combat</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 px-4 py-2">
              <Zap size={14} className="mr-2 fill-indigo-600" />
              {user?.subject}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Battle Area */}
            <div className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-12 text-center space-y-8 border-2 border-dashed border-slate-200 bg-white/50">
                      <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto">
                        <Sword size={48} className="text-indigo-600" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black text-slate-900">Ready for Battle?</h2>
                        <p className="text-slate-500 font-medium mt-4">
                          Challenge other students in {user?.subject}. Win duels to earn points and climb the global leaderboard.
                        </p>
                      </div>
                      <Button 
                        size="lg" 
                        onClick={startDuel} 
                        className={cn(
                          "px-12 h-16 text-lg shadow-xl",
                          user?.paymentStatus === 'paid' ? "shadow-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 shadow-none"
                        )}
                      >
                        {user?.paymentStatus === 'paid' ? (
                          'Find an Opponent'
                        ) : (
                          <>
                            <Lock className="mr-2" size={20} />
                            Unlock Arena
                          </>
                        )}
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {status === 'searching' && (
                  <motion.div
                    key="searching"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <Card className="p-12 text-center space-y-8">
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-4 border-4 border-amber-400 border-b-transparent rounded-full animate-spin-slow" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Users size={32} className="text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">Searching for Opponent</h2>
                        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs animate-pulse">Matching you with a worthy adversary...</p>
                      </div>
                      <Button variant="outline" onClick={cancelSearch} className="text-red-600 border-red-100 hover:bg-red-50">
                        Cancel Search
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {status === 'playing' && questions.length > 0 && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Battle HUD */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 bg-indigo-600 text-white border-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
                              {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Sword size={20} />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">You</p>
                              <p className="font-black truncate">{user?.name || 'Student'}</p>
                            </div>
                          </div>
                          <div className="text-2xl font-black">{score}</div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-slate-900 text-white border-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
                              {opponentPhotoURL ? (
                                <img src={opponentPhotoURL} alt={opponentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Shield size={20} />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Opponent</p>
                              <p className="font-black truncate">{opponentName}</p>
                            </div>
                          </div>
                          <div className="text-2xl font-black">{opponentScore !== null ? opponentScore : '?'}</div>
                        </div>
                      </Card>
                    </div>

                    {/* Question Card */}
                    <Card className="p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-1000" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                      
                      <div className="flex items-center justify-between mb-8">
                        <Badge variant="default" className="font-black">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                          <Timer size={16} />
                          <span>{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-8">
                        {questions[currentQuestionIndex].questionText}
                      </h2>

                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
                          <button 
                            key={key} 
                            onClick={() => handleAnswer(key)} 
                            className="group flex items-center gap-4 w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-left"
                          >
                            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                              {key}
                            </div>
                            {value}
                          </button>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {status === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="p-12 text-center space-y-8 overflow-hidden relative">
                      {winnerId === user?.uid && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-1/4 animate-bounce delay-100">✨</div>
                          <div className="absolute top-10 right-1/4 animate-bounce delay-300">🎉</div>
                          <div className="absolute bottom-10 left-1/3 animate-bounce delay-500">🏆</div>
                        </div>
                      )}

                      <div className={cn(
                        "w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8",
                        winnerId === user?.uid ? "bg-amber-100" : "bg-slate-100"
                      )}>
                        {winnerId === user?.uid ? (
                          <Crown size={64} className="text-amber-500" />
                        ) : winnerId === 'draw' ? (
                          <Users size={64} className="text-slate-400" />
                        ) : winnerId === null ? (
                          <Loader2 size={64} className="text-slate-400 animate-spin" />
                        ) : (
                          <Trophy size={64} className="text-slate-400" />
                        )}
                      </div>

                      <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                          {winnerId === user?.uid ? 'VICTORY!' : winnerId === 'draw' ? 'DRAW!' : winnerId === null ? 'WAITING FOR OPPONENT...' : 'DEFEAT'}
                        </h2>
                        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">
                          {winnerId === user?.uid ? 'You dominated the arena' : winnerId === 'draw' ? 'A perfectly matched battle' : winnerId === null ? 'Opponent is still finishing...' : 'A valiant effort, warrior'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Score</p>
                          <p className="text-2xl font-black text-slate-900">{score}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Taken</p>
                          <p className="text-2xl font-black text-slate-900">{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-8">
                        <Button onClick={() => setStatus('idle')} variant="outline" className="flex-1">Back to Arena</Button>
                        <Button onClick={startDuel} className="flex-1" disabled={winnerId === null}>Rematch</Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duel Leaderboard Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Crown size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">Arena Legends</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Duelists</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((entry, i) => (
                    <div 
                      key={entry.userId} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                        entry.userId === user?.uid 
                          ? "bg-indigo-50 border-indigo-100" 
                          : "bg-white border-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                          i === 0 ? "bg-amber-100 text-amber-600" :
                          i === 1 ? "bg-slate-100 text-slate-400" :
                          i === 2 ? "bg-orange-100 text-orange-600" :
                          "bg-slate-50 text-slate-400"
                        )}>
                          {i + 1}
                        </span>
                        {entry.photoURL ? (
                          <img src={entry.photoURL} alt={entry.name} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-[10px]">
                            {entry.name.charAt(0)}
                          </div>
                        )}
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[80px]">{entry.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{entry.points} pts</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{entry.wins} Wins</p>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs font-bold text-slate-400">No legends yet...</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-indigo-600 text-white border-none">
                <h3 className="font-black tracking-tight mb-2">Pro Tip</h3>
                <p className="text-xs font-medium text-indigo-100 leading-relaxed">
                  Winning duels earns you 10 points. Even if you lose, you still get 3 points for participating!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
