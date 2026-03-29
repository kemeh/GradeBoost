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

export async function generateDailyDrillFromModel(subject: string, model: string, topics: string[], mcqCount: number = 10, p2Count: number = 2, p3Count: number = 1) {
  try {
    console.log("Generating drill for model:", model, "with topics:", topics);
    
    // Query all questions for the subject and these topics
    // Firestore 'in' query supports up to 10 items. If topics > 10, we might need multiple queries.
    // Let's handle up to 10 for now, or fetch all and filter client-side if needed.
    // Actually, it's better to fetch all questions for the subject and filter client-side 
    // since we need multiple papers anyway.
    
    const q = query(
      collection(db, "exam_questions"),
      where("subject", "==", subject),
      where("isDailyDrill", "==", true)
    );
    
    const snapshot = await getDocs(q);
    let allQuestions: any[] = [];
    snapshot.forEach((doc) => {
      allQuestions.push({ id: doc.id, ...doc.data() });
    });

    // Filter by topics belonging to the model
    const modelQuestions = allQuestions.filter(q => topics.includes(q.topic));

    // Separate by paper
    const p1Questions = modelQuestions.filter(q => q.paper === 'Paper 1');
    const p2Questions = modelQuestions.filter(q => q.paper === 'Paper 2');
    const p3Questions = modelQuestions.filter(q => q.paper === 'Paper 3');

    // Shuffle each group
    const shuffle = (array: any[]) => array.sort(() => 0.5 - Math.random());
    
    const selectedP1 = shuffle(p1Questions).slice(0, mcqCount);
    const selectedP2 = shuffle(p2Questions).slice(0, p2Count);
    const selectedP3 = shuffle(p3Questions).slice(0, p3Count);

    const result = [...selectedP1, ...selectedP2, ...selectedP3];
    console.log(`Generated drill: ${selectedP1.length} P1, ${selectedP2.length} P2, ${selectedP3.length} P3`);
    
    return result;
  } catch (error) {
    console.error("Generate Daily Drill Error:", error);
    return [];
  }
}
