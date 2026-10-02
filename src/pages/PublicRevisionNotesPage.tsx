import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Sparkles, Search, Filter, Download, 
  Share2, CheckCircle2, AlertCircle, FileText, 
  ChevronRight, Languages, Printer, Award, Lightbulb, 
  HelpCircle, ArrowLeft, Layers, ShieldCheck, Flame
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { SEO } from '../components/SEO';
import { toast } from 'react-hot-toast';
import { DEFAULT_GCE_SUBJECTS } from '../data/defaultSubjects';

interface RevisionNoteItem {
  id: string;
  topicTitle: string;
  subject: string;
  classLevel: string;
  depthLevel?: string;
  language?: string;
  simpleDefinition: string;
  learningObjectives: string[];
  keyConcepts: string[];
  detailedExplanation: string;
  importantTerms: Array<{ term: string; definition: string }>;
  examples: string[];
  diagramsAndTables?: string;
  commonMistakes: string[];
  examinationTips: string[];
  summary: string;
  quickRevisionPoints: string[];
  practiceQuestions: Array<{
    question: string;
    options?: string[];
    answer?: string;
    explanation?: string;
  }>;
  furtherRevisionSuggestions?: string[];
  status?: string;
  createdAt?: string;
}

export default function PublicRevisionNotesPage() {
  const { classId, subjectId, noteId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<RevisionNoteItem[]>([]);
  const [selectedNote, setSelectedNote] = useState<RevisionNoteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectId || 'All');
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>(classId || 'All');
  const [depthPreset, setDepthPreset] = useState<'QUICK' | 'STANDARD' | 'DETAILED' | 'EXAM' | 'LAST_MINUTE'>('STANDARD');
  const [activeLang, setActiveLang] = useState<'en' | 'fr'>('en');

  // Custom Topic Generation Form
  const [showGenModal, setShowGenModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customSubject, setCustomSubject] = useState('Computer Science');
  const [customClass, setCustomClass] = useState('Upper Sixth');

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject, selectedClassLevel, activeLang]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== 'All') params.append('subject', selectedSubject);
      if (selectedClassLevel !== 'All') params.append('classLevel', selectedClassLevel);

      const res = await fetch(`/api/ai/revision-notes?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.revisionNotes) && data.revisionNotes.length > 0) {
        setNotes(data.revisionNotes);
        if (!selectedNote) {
          setSelectedNote(data.revisionNotes[0]);
        }
      } else {
        // Fallback default note for immediate student preview
        const defaultNote: RevisionNoteItem = {
          id: 'note_default_cs_normalization',
          topicTitle: 'Database Normalization (1NF, 2NF, 3NF)',
          subject: 'Computer Science',
          classLevel: 'Upper Sixth',
          depthLevel: 'EXAM',
          language: 'en',
          simpleDefinition: 'Database Normalization is the systematic technique of organizing relational database tables to reduce data redundancy and eliminate update anomalies.',
          learningObjectives: [
            'Define 1NF, 2NF, and 3NF according to Cameroon GCE Advanced Level Computer Science syllabus',
            'Identify Functional Dependencies, Partial Dependencies, and Transitive Dependencies',
            'Decompose unnormalized relations into Third Normal Form step-by-step'
          ],
          keyConcepts: [
            'Atomic Values & Repeating Groups (1NF)',
            'Full Functional Dependency vs Partial Dependency (2NF)',
            'Transitive Dependency Removal (3NF)',
            'Primary Keys & Composite Keys'
          ],
          detailedExplanation: `### Introduction to Normalization\n\nDatabase normalization prevents data duplication and protects data integrity during **INSERT**, **UPDATE**, and **DELETE** operations.\n\n#### 1. First Normal Form (1NF)\nA relation is in **1NF** if and only if:\n- Every attribute value is atomic (indivisible).\n- There are no repeating groups or multivalued attributes.\n\n#### 2. Second Normal Form (2NF)\nA relation is in **2NF** if:\n- It is already in 1NF.\n- Every non-prime attribute is **fully functionally dependent** on the primary key (No Partial Dependencies).\n\n#### 3. Third Normal Form (3NF)\nA relation is in **3NF** if:\n- It is in 2NF.\n- No non-prime attribute depends transitively on the primary key (No Transitive Dependencies $A \\rightarrow B \\rightarrow C$).`,
          importantTerms: [
            { term: 'Functional Dependency (X -> Y)', definition: 'An attribute Y is functionally dependent on X if each value of X uniquely determines Y.' },
            { term: 'Partial Dependency', definition: 'Occurs when a non-key attribute depends on only a portion of a composite primary key.' },
            { term: 'Transitive Dependency', definition: 'Occurs when a non-key attribute depends on another non-key attribute.' }
          ],
          examples: [
            'Cameroon MINESEC School Record: Decomposing (Student_ID, Course_Code, Student_Name, Teacher_Name) into separate Student, Course, and Enrollment tables.'
          ],
          diagramsAndTables: `| Normal Form | Requirement | Dependency Removed |\n| --- | --- | --- |\n| 1NF | Atomic values, unique key | Repeating Groups |\n| 2NF | In 1NF, Full Functional Dependency | Partial Dependencies |\n| 3NF | In 2NF, No Transitive Dependency | Transitive Dependencies |`,
          commonMistakes: [
            'Confusing Partial Dependency with Transitive Dependency on GCE Paper 2.',
            'Forgetting to specify composite keys when establishing 2NF.'
          ],
          examinationTips: [
            'Always state the Primary Key explicitly for each decomposed table.',
            'Show the intermediate functional dependencies before writing final 3NF relations.'
          ],
          summary: 'Normalization ensures relational databases are efficient, free from update anomalies, and maintain atomic integrity across 1NF, 2NF, and 3NF.',
          quickRevisionPoints: [
            '1NF = Remove repeating groups & non-atomic values.',
            '2NF = Remove partial dependencies on composite keys.',
            '3NF = Remove transitive dependencies between non-key fields.'
          ],
          practiceQuestions: [
            {
              question: 'A relation R(A, B, C, D) has composite key (A, B). If C depends solely on A, which normal form is violated?',
              options: ['A. First Normal Form (1NF)', 'B. Second Normal Form (2NF)', 'C. Third Normal Form (3NF)', 'D. Boyce-Codd Normal Form (BCNF)'],
              answer: 'B',
              explanation: 'C depends on only part of the composite key (A, B), which is a Partial Dependency, violating 2NF.'
            }
          ],
          furtherRevisionSuggestions: [
            'Solve 2024 GCE A-Level Computer Science Paper 2 Question 4 on Normalization.',
            'Revise Entity-Relationship (ER) Diagram mapping to relational schemas.'
          ]
        };
        setNotes([defaultNote]);
        setSelectedNote(defaultNote);
      }
    } catch (err) {
      console.error('Error fetching revision notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      toast.error('Please enter a topic title');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/revision-note/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: customSubject,
          classLevel: customClass,
          topicTitle: customTopic.trim(),
          depthLevel: depthPreset,
          language: activeLang
        })
      });

      const data = await res.json();
      if (data.success && data.revisionNote) {
        toast.success(`Generated Revision Note for ${customTopic}!`);
        setNotes(prev => [data.revisionNote, ...prev]);
        setSelectedNote(data.revisionNote);
        setShowGenModal(false);
        setCustomTopic('');
      } else {
        toast.error('Failed to generate revision note');
      }
    } catch (err: any) {
      toast.error('Error connecting to AI service');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintNote = () => {
    window.print();
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = !searchQuery.trim() || 
      n.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.simpleDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <SEO 
        title={`${selectedNote ? selectedNote.topicTitle : 'Curriculum Revision Notes'} | Edulpha Digital School`}
        description="Comprehensive Cameroon GCE & MINESEC revision notes, 17-part structured study guides, examiner tips, and practice questions."
      />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl shadow-md">
                <BookOpen size={20} />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Edulpha AI Revision Library
                  <Badge variant="indigo" className="text-[10px]">MINESEC & GCE</Badge>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Authoritative 17-Part Study Guides & Examiner Criteria
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={() => setActiveLang(prev => prev === 'en' ? 'fr' : 'en')}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Languages size={15} />
              <span>{activeLang === 'en' ? 'English (Anglais)' : 'Français (French)'}</span>
            </button>

            <Button
              onClick={() => setShowGenModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Sparkles size={15} /> Generate Any Note
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar: Notes Navigation & Filters (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search & Subject Filter Card */}
          <Card className="p-4 space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics, subjects, or keywords..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="All">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="ICT">ICT</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Economics">Economics</option>
                <option value="Accounting">Accounting</option>
              </select>

              <select
                value={selectedClassLevel}
                onChange={e => setSelectedClassLevel(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="All">All Classes</option>
                <option value="Form 5">Form 5 (O-Level)</option>
                <option value="Upper Sixth">Upper Sixth (A-Level)</option>
                <option value="Lower Sixth">Lower Sixth</option>
                <option value="BEPC">BEPC</option>
                <option value="Probatoire">Probatoire</option>
                <option value="Baccalauréat">Baccalauréat</option>
              </select>
            </div>
          </Card>

          {/* Notes List */}
          <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold">Loading notes library...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <Card className="p-6 text-center text-slate-500 text-xs font-bold">
                No revision notes found matching filters. Click "Generate Any Note" above!
              </Card>
            ) : (
              filteredNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNote(n)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5",
                    selectedNote?.id === n.id
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-md"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={selectedNote?.id === n.id ? "secondary" : "indigo"} className="text-[10px]">
                      {n.subject}
                    </Badge>
                    <span className={cn("text-[10px] font-bold", selectedNote?.id === n.id ? "text-indigo-200" : "text-slate-400")}>
                      {n.classLevel}
                    </span>
                  </div>
                  <h3 className="text-xs font-black line-clamp-2">{n.topicTitle}</h3>
                  <p className={cn("text-[11px] line-clamp-2", selectedNote?.id === n.id ? "text-indigo-100" : "text-slate-500 dark:text-slate-400")}>
                    {n.simpleDefinition}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Note Reader View (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedNote ? (
            <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 print:shadow-none print:border-none">
              
              {/* Header Info */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="text-xs font-black uppercase">{selectedNote.subject}</Badge>
                    <Badge variant="secondary" className="text-xs font-bold">{selectedNote.classLevel}</Badge>
                    {selectedNote.depthLevel && (
                      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs font-bold">
                        {selectedNote.depthLevel} REVISION
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <Button onClick={handlePrintNote} size="sm" variant="outline" className="text-xs font-bold gap-1.5 rounded-xl">
                      <Printer size={14} /> Print / Save PDF
                    </Button>
                    <Button onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Note link copied!');
                    }} size="sm" variant="outline" className="text-xs font-bold gap-1.5 rounded-xl">
                      <Share2 size={14} /> Share
                    </Button>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedNote.topicTitle}
                </h2>

                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block text-[10px]">Simple Definition</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {selectedNote.simpleDefinition}
                  </p>
                </div>
              </div>

              {/* Learning Objectives & Key Concepts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Objectives */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Award size={15} className="text-indigo-600" /> Learning Objectives
                  </h3>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {selectedNote.learningObjectives?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Concepts */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Lightbulb size={15} className="text-amber-500" /> Key Concepts
                  </h3>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {selectedNote.keyConcepts?.map((kc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span>{kc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Detailed Explanation */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Detailed Explanation & Syllabus Content
                </h3>
                <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  {selectedNote.detailedExplanation}
                </div>
              </div>

              {/* Diagrams & Tables */}
              {selectedNote.diagramsAndTables && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Structured Summary Table / Diagrams
                  </h3>
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre">
                    {selectedNote.diagramsAndTables}
                  </div>
                </div>
              )}

              {/* Common Mistakes & Examination Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl space-y-2">
                  <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle size={16} className="text-rose-600" /> Common Student Errors
                  </h4>
                  <ul className="space-y-1 text-rose-800 dark:text-rose-300">
                    {selectedNote.commonMistakes?.map((cm, i) => (
                      <li key={i}>• {cm}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-600" /> GCE Examiner Advice
                  </h4>
                  <ul className="space-y-1 text-emerald-800 dark:text-emerald-300">
                    {selectedNote.examinationTips?.map((et, i) => (
                      <li key={i}>✓ {et}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Practice Questions & Answers */}
              {selectedNote.practiceQuestions && selectedNote.practiceQuestions.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-600" /> Examination Practice Questions
                  </h3>
                  <div className="space-y-3">
                    {selectedNote.practiceQuestions.map((pq, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                        <p className="font-bold text-slate-900 dark:text-white">Q{idx + 1}: {pq.question}</p>
                        {pq.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                            {pq.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {pq.explanation && (
                          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 rounded-xl font-medium text-[11px]">
                            <strong>Correct Answer ({pq.answer || 'Key'}):</strong> {pq.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Revision Bullets */}
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2 text-xs">
                <h4 className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={15} className="text-amber-600" /> Quick Revision Bullets (Last Minute)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedNote.quickRevisionPoints?.map((qp, i) => (
                    <div key={i} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-800 dark:text-slate-200 border border-amber-200/60 dark:border-amber-900/40">
                      ⚡ {qp}
                    </div>
                  ))}
                </div>
              </div>

            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-500">
              Select a revision note from the list or generate a new topic.
            </Card>
          )}
        </div>

      </main>

      {/* Custom Note Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" /> Generate AI Revision Note
              </h3>
              <button onClick={() => setShowGenModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleGenerateCustomNote} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="ICT">ICT</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                  <option value="Accounting">Accounting</option>
                </select>
              </div>

              <div>
                <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">Class Level</label>
                <select
                  value={customClass}
                  onChange={e => setCustomClass(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Form 5">Form 5 (O-Level)</option>
                  <option value="Upper Sixth">Upper Sixth (A-Level)</option>
                  <option value="Lower Sixth">Lower Sixth</option>
                  <option value="BEPC">BEPC</option>
                  <option value="Probatoire">Probatoire</option>
                  <option value="Baccalauréat">Baccalauréat</option>
                </select>
              </div>

              <div>
                <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">Topic Title</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="e.g. Boolean Algebra Simplification"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">Depth Preset</label>
                <select
                  value={depthPreset}
                  onChange={e => setDepthPreset(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="STANDARD">Standard Revision Note</option>
                  <option value="QUICK">Quick Revision</option>
                  <option value="DETAILED">Detailed Deep Dive</option>
                  <option value="EXAM">Exam Focused (Past Paper Criteria)</option>
                  <option value="LAST_MINUTE">Last-Minute Exam Prep</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" onClick={() => setShowGenModal(false)} variant="outline" className="text-xs font-bold rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <Sparkles size={14} /> {isGenerating ? 'Generating...' : 'Generate Note'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
