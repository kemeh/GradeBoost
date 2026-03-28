import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchDailyDrill(subject: string, paper: string) {
  try {
    console.log("Fetching questions for subject:", subject, "and paper:", paper);
    
    // Use Firestore query to filter on the server side
    const q = query(
      collection(db, "exam_questions"),
      where("subject", "==", subject),
      where("paper", "==", paper),
      limit(100) // Fetch a reasonable amount to shuffle from
    );
    
    const snapshot = await getDocs(q);

    let questions: any[] = [];

    snapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    console.log("Filtered questions count:", questions.length);

    // Shuffle questions
    questions.sort(() => 0.5 - Math.random());

    // Return only 10 questions
    const result = questions.slice(0, 10);
    console.log("Number of questions returned:", result.length);
    return result;

  } catch (error) {
    console.error("Daily Drill Error:", error);
    return [];
  }
}
