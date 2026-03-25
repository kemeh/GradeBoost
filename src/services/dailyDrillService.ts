import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchDailyDrill(subject: string, paper: string) {
  try {
    console.log("Fetching Daily Drill:", subject, paper);
    
    const q = query(
      collection(db, "exam_questions"),
      where("subject", "==", subject),
      where("paper", "==", paper),
      limit(10)
    );

    const querySnapshot = await getDocs(q);

    let questions: any[] = [];
    querySnapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    console.log("Daily Drill Questions:", questions);
    console.log("Number of questions:", questions.length);

    return questions;
  } catch (error) {
    console.error("Error fetching Daily Drill:", error);
    return [];
  }
}
