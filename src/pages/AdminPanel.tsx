import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, addDoc, doc, setDoc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit, Save, X, Database, Sparkles, FileText, Clock, Trophy, CheckCircle2, AlertCircle, Eye, Download } from 'lucide-react';

export default function AdminPanel() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'exams' | 'submissions'>('lessons');
  
  const [newLesson, setNewLesson] = useState({
    day: 1,
    title: '',
    content: '',
    quiz: Array(10).fill(null).map(() => ({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }))
  });

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    duration: 90,
    totalQuestions: 0,
    difficulty: 'Advanced',
    category: 'Computer Science',
    type: 'MCQ' as 'MCQ' | 'STRUCTURED',
    questions: [] as any[]
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    marks: 1
  });

  useEffect(() => {
    fetchLessons();
    fetchExams();
    fetchSubmissions();
  }, []);

  const fetchLessons = async () => {
    try {
      const q = query(collection(db, 'lessons'), orderBy('day', 'asc'));
      const snapshot = await getDocs(q);
      const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonsData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    try {
      const q = query(collection(db, 'mockExams'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const examsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(examsData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'examSubmissions'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const submissionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(submissionsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedExams = async () => {
    if (!window.confirm('This will add a comprehensive set of GCE Computer Science and ICT Mock Exams (Papers 1, 2, and 3) to the database. Continue?')) return;
    
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      const seedExams = [
        // COMPUTER SCIENCE PAPERS
        {
          id: 'gce-cs-p1-2025',
          title: 'GCE A-Level CS Paper 1 (2025 Mock)',
          description: '10 Multiple Choice Questions covering the entire syllabus: Architecture, OS, Networking, and Algorithms.',
          duration: 45,
          totalQuestions: 10,
          difficulty: 'Advanced',
          category: 'Computer Science',
          type: 'MCQ',
          createdAt: new Date().toISOString(),
          questions: [
            { question: "In the Von Neumann architecture, which component is responsible for fetching and decoding instructions?", options: ["ALU", "CU", "MAR", "PC"], correctAnswer: 1, explanation: "The Control Unit (CU) manages the fetch-decode-execute cycle." },
            { question: "Which sorting algorithm has a worst-case time complexity of O(n²)?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"], correctAnswer: 2, explanation: "Bubble Sort has O(n²) complexity." },
            { question: "What is the primary purpose of a Subnet Mask?", options: ["Identify MAC", "Distinguish network/host portions", "Unique name", "Encrypt packets"], correctAnswer: 1, explanation: "Subnet masks divide IP addresses into network and host parts." },
            { question: "Which data structure is FIFO?", options: ["Stack", "Queue", "Tree", "Hash Table"], correctAnswer: 1, explanation: "Queue is FIFO." },
            { question: "In Boolean Algebra, A + (A . B) = ?", options: ["A", "B", "A.B", "1"], correctAnswer: 0, explanation: "Absorption Law." },
            { question: "What is the main function of an Operating System?", options: ["Word processing", "Resource management", "Web browsing", "Database storage"], correctAnswer: 1, explanation: "OS manages hardware and software resources." },
            { question: "Which layer of the OSI model handles routing?", options: ["Physical", "Data Link", "Network", "Transport"], correctAnswer: 2, explanation: "Network layer handles routing." },
            { question: "What is a 'Primary Key'?", options: ["Password", "Unique identifier", "Most used field", "Encryption key"], correctAnswer: 1, explanation: "Primary key uniquely identifies a record." },
            { question: "Which logic gate returns 1 only if both inputs are 1?", options: ["OR", "AND", "XOR", "NAND"], correctAnswer: 1, explanation: "AND gate." },
            { question: "What is 'Recursion'?", options: ["Looping", "Function calling itself", "Variable assignment", "Error handling"], correctAnswer: 1, explanation: "Recursion is when a function calls itself." }
          ]
        },
        {
          id: 'gce-cs-p2-2025',
          title: 'GCE A-Level CS Paper 2 (Structured)',
          description: '1 Structural question worth 17 marks as on a standard GCE paper.',
          duration: 60,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'Computer Science',
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "(a) Define the term 'Normalization' [2 marks]. (b) Explain the requirements for a table to be in 3rd Normal Form (3NF) [6 marks]. (c) Given a flat file of student registrations, decompose it into 3NF relations, identifying primary and foreign keys [9 marks]. Total: 17 Marks.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on data redundancy, primary keys, and transitive dependencies.",
              marks: 17
            }
          ]
        },
        {
          id: 'gce-cs-p3-2025',
          title: 'GCE A-Level CS Paper 3 (Practical)',
          description: '1 Practical question as on a standard GCE paper (C Programming & Databases).',
          duration: 120,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'Computer Science',
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "Design and implement a C program that reads a list of 100 integers from a file, sorts them using the Quick Sort algorithm, and stores the sorted list in a new file. Additionally, create a database table to store the execution time of each run.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on file I/O, algorithm implementation, and database connectivity.",
              marks: 25
            }
          ]
        },
        // ICT PAPERS
        {
          id: 'gce-ict-p1-2025',
          title: 'GCE A-Level ICT Paper 1 (MCQ)',
          description: '10 Multiple Choice Questions on Information Systems and E-commerce.',
          duration: 45,
          totalQuestions: 10,
          difficulty: 'Advanced',
          category: 'ICT',
          type: 'MCQ',
          createdAt: new Date().toISOString(),
          questions: [
            { question: "Example of MIS?", options: ["Word", "Inventory", "Browser", "OS"], correctAnswer: 1, explanation: "Inventory control is an MIS." },
            { question: "B2C stands for?", options: ["Business to Consumer", "Business to Company", "Buyer to Customer", "Back to Center"], correctAnswer: 0, explanation: "Business to Consumer." },
            { question: "What is 'Cloud Computing'?", options: ["Weather forecasting", "On-demand delivery of IT resources over the internet", "Local storage", "Type of hardware"], correctAnswer: 1, explanation: "On-demand IT resources." },
            { question: "Which is a 'Social Impact' of ICT?", options: ["Faster CPU", "Digital Divide", "More RAM", "New OS"], correctAnswer: 1, explanation: "Digital divide is a social impact." },
            { question: "What is 'Phishing'?", options: ["Fishing", "Fraudulent attempt to get sensitive info", "Virus", "Protocol"], correctAnswer: 1, explanation: "Fraudulent attempt to get info." },
            { question: "Purpose of a 'Firewall'?", options: ["Cooling", "Prevent unauthorized access", "Speed up internet", "Clean disk"], correctAnswer: 1, explanation: "Firewalls prevent unauthorized access." },
            { question: "What is 'Big Data'?", options: ["Large hard drive", "Extremely large data sets analyzed computationally", "A big file", "A giant server"], correctAnswer: 1, explanation: "Extremely large data sets." },
            { question: "Which is an 'Output Device'?", options: ["Keyboard", "Mouse", "Monitor", "Scanner"], correctAnswer: 2, explanation: "Monitor is an output device." },
            { question: "What is 'Encryption'?", options: ["Deleting data", "Converting data into code to prevent unauthorized access", "Compressing data", "Copying data"], correctAnswer: 1, explanation: "Converting data into code." },
            { question: "What is 'SEO'?", options: ["Search Engine Optimization", "System Entry Office", "Secure Email Output", "Server Error Only"], correctAnswer: 0, explanation: "Search Engine Optimization." }
          ]
        },
        {
          id: 'gce-ict-p2-2025',
          title: 'GCE A-Level ICT Paper 2 (Structured)',
          description: '1 Structural question worth 17 marks as on a standard GCE paper.',
          duration: 60,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'ICT',
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "(a) Describe the 'Analysis' phase of the SDLC [4 marks]. (b) Compare 'Parallel' and 'Phased' implementation methods [6 marks]. (c) Discuss the social and ethical implications of implementing an AI-driven recruitment system [7 marks]. Total: 17 Marks.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on SDLC phases, implementation strategies, and ethics.",
              marks: 17
            }
          ]
        },
        {
          id: 'gce-ict-p3-2025',
          title: 'GCE A-Level ICT Paper 3 (Practical)',
          description: '1 Practical question as on a standard GCE paper (Spreadsheets & Databases).',
          duration: 120,
          totalQuestions: 1,
          difficulty: 'Advanced',
          category: 'ICT',
          type: 'STRUCTURED',
          createdAt: new Date().toISOString(),
          questions: [
            {
              question: "Develop a complex spreadsheet model for a retail business to track sales, calculate commissions using nested IF functions, and generate a pivot table for monthly performance analysis. Additionally, design a database to store customer feedback.",
              options: [],
              correctAnswer: 0,
              explanation: "Focus on advanced spreadsheet functions and database design.",
              marks: 25
            }
          ]
        }
      ];

      for (const exam of seedExams) {
        const examRef = doc(db, 'mockExams', exam.id);
        batch.set(examRef, exam);
      }

      await batch.commit();
      fetchExams();
      alert('GCE Mock Exams (Papers 1, 2, and 3) seeded successfully with standard structures!');
    } catch (err) {
      console.error(err);
      alert('Error seeding exams');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveLesson = async () => {
    try {
      const lessonId = `day_${newLesson.day}`;
      await setDoc(doc(db, 'lessons', lessonId), newLesson);
      fetchLessons();
      setNewLesson({
        day: lessons.length + 2,
        title: '',
        content: '',
        quiz: Array(10).fill(null).map(() => ({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }))
      });
      alert('Lesson saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving lesson');
    }
  };

  const handleAddQuestionToExam = () => {
    if (!newQuestion.question) return;
    setNewExam({
      ...newExam,
      questions: [...newExam.questions, newQuestion],
      totalQuestions: newExam.questions.length + 1
    });
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      marks: 1
    });
  };

  const handleSaveExam = async () => {
    try {
      if (!newExam.title || newExam.questions.length === 0) {
        alert('Please add a title and at least one question.');
        return;
      }
      const examId = newExam.title.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'mockExams', examId), {
        ...newExam,
        createdAt: new Date().toISOString()
      });
      fetchExams();
      setNewExam({
        title: '',
        description: '',
        duration: 90,
        totalQuestions: 0,
        difficulty: 'Advanced',
        category: 'Computer Science',
        type: 'MCQ',
        questions: []
      });
      alert('Exam saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving exam');
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const subRef = doc(db, 'examSubmissions', submissionId);
      await updateDoc(subRef, {
        grade,
        feedback,
        status: 'GRADED',
        gradedAt: new Date().toISOString()
      });
      fetchSubmissions();
      alert('Submission graded!');
    } catch (err) {
      console.error(err);
      alert('Error grading submission');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteDoc(doc(db, 'lessons', id));
      fetchLessons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await deleteDoc(doc(db, 'mockExams', id));
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin Control Center</h1>
          <p className="text-slate-500 font-medium">Manage curriculum, exams, and student performance.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSeedExams}
            disabled={isSeeding}
            className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSeeding ? <Sparkles className="animate-spin" size={16} /> : <Database size={16} />}
            Seed Mock Exams
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 bg-slate-50 p-2 rounded-[2rem] w-fit border border-slate-100">
        {[
          { id: 'lessons', label: 'Lessons', icon: FileText },
          { id: 'exams', label: 'Mock Exams', icon: Trophy },
          { id: 'submissions', label: 'Submissions', icon: CheckCircle2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Lesson</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Day</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newLesson.day}
                    onChange={e => setNewLesson({ ...newLesson, day: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newLesson.title}
                    onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                  />
                </div>
              </div>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium h-48 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                placeholder="Lesson Content (Markdown supported)..."
                value={newLesson.content}
                onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
              />

              <div className="space-y-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Quiz (10 MCQs)</h3>
                <p className="text-xs text-slate-400 font-bold italic">Include 8 general MCQs, 1 Paper 2 style MCQ, and 1 Paper 3 style MCQ.</p>
                
                <div className="space-y-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {newLesson.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Question {qIdx + 1}</span>
                        {qIdx === 8 && <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Paper 2 Style</span>}
                        {qIdx === 9 && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Paper 3 Style</span>}
                      </div>
                      <input
                        type="text"
                        placeholder="Question text..."
                        className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600"
                        value={q.question}
                        onChange={e => {
                          const quiz = [...newLesson.quiz];
                          quiz[qIdx].question = e.target.value;
                          setNewLesson({ ...newLesson, quiz });
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-600"
                            value={opt}
                            onChange={e => {
                              const quiz = [...newLesson.quiz];
                              quiz[qIdx].options[oIdx] = e.target.value;
                              setNewLesson({ ...newLesson, quiz });
                            }}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600"
                          value={q.correctAnswer}
                          onChange={e => {
                            const quiz = [...newLesson.quiz];
                            quiz[qIdx].correctAnswer = parseInt(e.target.value);
                            setNewLesson({ ...newLesson, quiz });
                          }}
                        >
                          <option value={0}>Option A is Correct</option>
                          <option value={1}>Option B is Correct</option>
                          <option value={2}>Option C is Correct</option>
                          <option value={3}>Option D is Correct</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Explanation..."
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-600"
                          value={q.explanation}
                          onChange={e => {
                            const quiz = [...newLesson.quiz];
                            quiz[qIdx].explanation = e.target.value;
                            setNewLesson({ ...newLesson, quiz });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveLesson}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                Save Lesson
              </button>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Existing Lessons</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {lessons.map(lesson => (
                <div key={lesson.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Day {lesson.day}</span>
                    <h3 className="font-black text-slate-900 tracking-tight">{lesson.title}</h3>
                  </div>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Mock Exam</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Exam Title</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newExam.title}
                    onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration (Mins)</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    value={newExam.duration}
                    onChange={e => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Exam Type</label>
                <div className="flex gap-4">
                  {['MCQ', 'STRUCTURED'].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewExam({ ...newExam, type: type as any, questions: [] })}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 transition-all ${
                        newExam.type === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-blue-200'
                      }`}
                    >
                      {type === 'MCQ' ? 'Paper 1 (MCQ)' : 'Paper 2 (Structured)'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
                <h3 className="font-black text-slate-900">Add {newExam.type === 'MCQ' ? 'Question' : 'Structured Task'}</h3>
                <textarea
                  className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder={newExam.type === 'MCQ' ? "Question text..." : "Describe the task or question for the student to answer in their upload..."}
                  value={newQuestion.question}
                  onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                />
                
                {newExam.type === 'MCQ' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          value={opt}
                          onChange={e => {
                            const opts = [...newQuestion.options];
                            opts[i] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: opts });
                          }}
                        />
                      ))}
                    </div>
                    <select
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                      value={newQuestion.correctAnswer}
                      onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                    >
                      <option value={0}>Option A is Correct</option>
                      <option value={1}>Option B is Correct</option>
                      <option value={2}>Option C is Correct</option>
                      <option value={3}>Option D is Correct</option>
                    </select>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Marks</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    value={newQuestion.marks}
                    onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })}
                  />
                </div>

                <button
                  onClick={handleAddQuestionToExam}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add to Exam
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions Added: {newExam.questions.length}</p>
                <button
                  onClick={handleSaveExam}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  Publish Mock Exam
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Existing Mock Exams</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{exam.category}</span>
                    <h3 className="font-black text-slate-900 tracking-tight">{exam.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {exam.type === 'MCQ' ? 'Paper 1 (MCQ)' : 'Paper 2 (Structured)'} • {exam.questions.length} Questions • {exam.duration} Mins
                    </p>
                  </div>
                  <button onClick={() => handleDeleteExam(exam.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'submissions' && (
        <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Submissions (Paper 2)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sub.examTitle}</p>
                    <h3 className="font-black text-slate-900 tracking-tight">{sub.studentName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <FileText className="text-blue-600" size={24} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">Answer_Sheet.pdf</p>
                    <p className="text-[10px] text-slate-400 font-bold">Uploaded {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                    <Download size={18} />
                  </a>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Grade (0-100)</label>
                    <input
                      type="number"
                      className="w-full p-3 bg-white border border-slate-100 rounded-xl font-bold"
                      placeholder="Enter score..."
                      defaultValue={sub.grade}
                      onBlur={e => handleGradeSubmission(sub.id, parseInt(e.target.value), sub.feedback || '')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Feedback</label>
                    <textarea
                      className="w-full p-3 bg-white border border-slate-100 rounded-xl font-medium text-xs h-24"
                      placeholder="Add comments for the student..."
                      defaultValue={sub.feedback}
                      onBlur={e => handleGradeSubmission(sub.id, sub.grade || 0, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold">No submissions to grade yet.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
