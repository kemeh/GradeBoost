import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { QuestionPaper, LMSLesson, StudyPlanModel } from '../../types';
import { Card, Button, Badge, cn } from '../ui';
import { FileText, BookOpen, Calendar, Plus, Trash2, ExternalLink, X, Upload, CheckCircle2, Loader2, Sparkles, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FileUpload from '../FileUpload';
import DynamicQuestionPaperUploadModal from './DynamicQuestionPaperUploadModal';
import { publishQuestionPaper, fetchQuestionPapersFast } from '../../services/questionPaperService';

export default function AdminContentCurriculum() {
  const [activeTab, setActiveTab] = useState<'papers' | 'lessons' | 'study_plans'>('papers');
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlanModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Paper Form
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [paperForm, setPaperForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    subject: 'Biology',
    paperType: 'Paper 1',
    description: '',
    correctAnswersRaw: '',
    pdfUrl: '',
  });

  // Lesson Form
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    subject: 'Biology',
    topic: 'Cell Biology',
    level: 'Ordinary level',
    summary: '',
    videoUrl: '',
    contentUrl: '',
    estimatedMinutes: 30,
  });

  // Study Plan Form
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: '',
    level: 'Ordinary level',
    subject: 'Biology',
    durationWeeks: 8,
    description: '',
    recommendedDailyDrills: 5,
  });

  useEffect(() => {
    fetchCurriculumData();
  }, []);

  const fetchCurriculumData = async () => {
    setLoading(true);
    try {
      // Papers
      const papersSnap = await getDocs(query(collection(db, 'question_papers'), orderBy('year', 'desc')));
      setPapers(papersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as QuestionPaper[]);

      // Lessons
      const lessonsSnap = await getDocs(collection(db, 'lms_lessons'));
      setLessons(lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as LMSLesson[]);

      // Study Plans
      const plansSnap = await getDocs(collection(db, 'study_plans'));
      if (plansSnap.empty) {
        const defaultPlans: StudyPlanModel[] = [
          {
            id: 'bio-o-level-mastery',
            title: '60-Day Ordinary Level Biology Mastery Plan',
            level: 'Ordinary level',
            subject: 'Biology',
            durationWeeks: 8,
            description: 'Structured 8-week syllabus roadmap covering Cell Structure, Genetics, Physiology, and Ecology with daily MCQ drills.',
            recommendedDailyDrills: 5,
            isActive: true,
          },
          {
            id: 'chem-a-level-mastery',
            title: '90-Day Advanced Level Chemistry Exam Blueprint',
            level: 'Advance level',
            subject: 'Chemistry',
            durationWeeks: 12,
            description: 'Comprehensive physical, inorganic, and organic chemistry topic sequences with Paper 2 structured synthesis.',
            recommendedDailyDrills: 8,
            isActive: true,
          }
        ];
        for (const p of defaultPlans) {
          await setDoc(doc(db, 'study_plans', p.id), p);
        }
        setStudyPlans(defaultPlans);
      } else {
        setStudyPlans(plansSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StudyPlanModel[]);
      }

    } catch (err) {
      console.error('Error fetching curriculum data:', err);
      toast.error('Failed to load curriculum components.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperForm.pdfUrl) {
      toast.error('Please upload or provide a PDF URL for the question paper');
      return;
    }

    try {
      const correctAnswers: Record<string, string> = {};
      if (paperForm.correctAnswersRaw.trim()) {
        const parts = paperForm.correctAnswersRaw.split(',');
        parts.forEach((part, index) => {
          const val = part.trim().toUpperCase();
          if (val) {
            correctAnswers[(index + 1).toString()] = val;
          }
        });
      }

      await publishQuestionPaper({
        title: paperForm.title,
        year: Number(paperForm.year),
        subject: paperForm.subject,
        paperType: paperForm.paperType,
        description: paperForm.description,
        pdfUrl: paperForm.pdfUrl,
        correctAnswers,
      }, 'Admin');

      toast.success('Question paper created successfully!');
      setShowPaperModal(false);
      setPaperForm({
        title: '',
        year: new Date().getFullYear(),
        subject: 'Biology',
        paperType: 'Paper 1',
        description: '',
        correctAnswersRaw: '',
        pdfUrl: '',
      });
      fetchCurriculumData();
    } catch (err) {
      toast.error('Failed to create question paper');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lms_lessons'), {
        title: lessonForm.title,
        subject: lessonForm.subject,
        topic: lessonForm.topic,
        level: lessonForm.level,
        summary: lessonForm.summary,
        videoUrl: lessonForm.videoUrl,
        contentUrl: lessonForm.contentUrl,
        estimatedMinutes: Number(lessonForm.estimatedMinutes),
        status: 'published',
        createdAt: serverTimestamp(),
      });

      toast.success(`Lesson "${lessonForm.title}" created.`);
      setShowLessonModal(false);
      fetchCurriculumData();
    } catch (err) {
      toast.error('Failed to create lesson');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = planForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await setDoc(doc(db, 'study_plans', id), {
        id,
        title: planForm.title,
        level: planForm.level,
        subject: planForm.subject,
        durationWeeks: Number(planForm.durationWeeks),
        description: planForm.description,
        recommendedDailyDrills: Number(planForm.recommendedDailyDrills),
        isActive: true,
        createdAt: serverTimestamp(),
      });

      toast.success(`Study Plan "${planForm.title}" created.`);
      setShowPlanModal(false);
      fetchCurriculumData();
    } catch (err) {
      toast.error('Failed to create study plan');
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    try {
      await deleteDoc(doc(db, 'question_papers', id));
      toast.success('Paper deleted');
      fetchCurriculumData();
    } catch (err) {
      toast.error('Failed to delete paper');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteDoc(doc(db, 'lms_lessons', id));
      toast.success('Lesson deleted');
      fetchCurriculumData();
    } catch (err) {
      toast.error('Failed to delete lesson');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study plan?')) return;
    try {
      await deleteDoc(doc(db, 'study_plans', id));
      toast.success('Study plan deleted');
      fetchCurriculumData();
    } catch (err) {
      toast.error('Failed to delete study plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Content & Curriculum Management</h2>
          <p className="text-sm font-medium text-slate-500">
            Manage GCE Past Papers, LMS Lessons, and Guided Academic Study Plans.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('papers')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'papers' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <FileText size={14} /> GCE Papers ({papers.length})
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'lessons' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <BookOpen size={14} /> LMS Lessons ({lessons.length})
        </button>
        <button
          onClick={() => setActiveTab('study_plans')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            activeTab === 'study_plans' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Calendar size={14} /> Study Plans ({studyPlans.length})
        </button>
      </div>

      {/* Papers Tab */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowPaperModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Upload New Question Paper
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            {papers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">No papers uploaded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                      <th className="p-4 pl-6">Paper Title</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Paper Type</th>
                      <th className="p-4">Year</th>
                      <th className="p-4">Answer Keys</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {papers.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-4 pl-6 font-bold text-slate-900 text-sm">{p.title}</td>
                        <td className="p-4 text-xs font-bold text-indigo-600">{p.subject}</td>
                        <td className="p-4"><Badge variant="neutral" className="rounded-xl">{p.paperType}</Badge></td>
                        <td className="p-4 text-xs font-bold text-slate-700">{p.year}</td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {p.correctAnswers ? `${Object.keys(p.correctAnswers).length} answers mapped` : 'None'}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <a 
                            href={p.pdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                          >
                            <ExternalLink size={14} /> PDF
                          </a>
                          <button 
                            onClick={() => handleDeletePaper(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowLessonModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Add LMS Lesson
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lessons.map(l => (
              <Card key={l.id} className="p-6 space-y-4 border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="neutral" className="mb-2 text-[10px]">{l.subject}</Badge>
                    <h3 className="text-base font-black text-slate-900">{l.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{l.summary}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteLesson(l.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Topic: {l.topic || 'General'}</span>
                  <span>{l.estimatedMinutes || 30} mins</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Study Plans Tab */}
      {activeTab === 'study_plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowPlanModal(true)} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Create Study Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPlans.map(plan => (
              <Card key={plan.id} className="p-6 space-y-4 border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="indigo" className="text-[10px]">{plan.subject}</Badge>
                      <Badge variant="neutral" className="text-[10px]">{plan.level}</Badge>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{plan.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{plan.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Plan Duration</span>
                    <span className="text-slate-800 font-black">{plan.durationWeeks} Weeks</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Daily Target</span>
                    <span className="text-emerald-600 font-black">{plan.recommendedDailyDrills || 5} Drills/day</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Question Paper Upload Modal */}
      <DynamicQuestionPaperUploadModal
        isOpen={showPaperModal}
        onClose={() => setShowPaperModal(false)}
        onPaperSaved={(newPaper) => {
          setPapers(prev => [newPaper, ...prev]);
          fetchCurriculumData();
        }}
      />

      {/* Modal: Lesson */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Add LMS Digital Lesson</h3>
              <button onClick={() => setShowLessonModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Lesson Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Enzyme Kinetics & Catalysis" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={lessonForm.title}
                  onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Subject</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={lessonForm.subject}
                    onChange={e => setLessonForm({...lessonForm, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Topic</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={lessonForm.topic}
                    onChange={e => setLessonForm({...lessonForm, topic: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Lesson Summary</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={lessonForm.summary}
                  onChange={e => setLessonForm({...lessonForm, summary: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Video Embed URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://www.youtube.com/embed/..." 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={lessonForm.videoUrl}
                  onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">Create Lesson</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Study Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Create Academic Study Plan</h3>
              <button onClick={() => setShowPlanModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Study Plan Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 60-Day Physics Intensive Plan" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={planForm.title}
                  onChange={e => setPlanForm({...planForm, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Subject</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={planForm.subject}
                    onChange={e => setPlanForm({...planForm, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Level</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                    value={planForm.level}
                    onChange={e => setPlanForm({...planForm, level: e.target.value})}
                  >
                    <option value="Ordinary level">Ordinary level</option>
                    <option value="Advance level">Advance level</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Duration (Weeks)</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={planForm.durationWeeks}
                    onChange={e => setPlanForm({...planForm, durationWeeks: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Daily Drills Target</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                    value={planForm.recommendedDailyDrills}
                    onChange={e => setPlanForm({...planForm, recommendedDailyDrills: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={planForm.description}
                  onChange={e => setPlanForm({...planForm, description: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Study Plan</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
