import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchDailyDrill(subject: string, paper: string) {
  try {
    console.log("Fetching questions for subject:", subject, "and paper:", paper);
    const snapshot = await getDocs(collection(db, "exam_questions"));

    let questions: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Debug: Log all fetched questions (as requested)
      // console.log("Fetched question:", data);

      if (data.subject === subject && data.paper === paper) {
        questions.push({ id: doc.id, ...data });
      }
    });

    console.log("Filtered questions count:", questions.length);
    console.log("Filtered questions:", questions);

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
