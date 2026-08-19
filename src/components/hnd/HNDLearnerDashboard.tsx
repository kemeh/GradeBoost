import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Calendar, ClipboardList, 
  Clock, FileText, Layout, 
  CheckCircle2, AlertCircle, ChevronRight,
  TrendingUp, Award, Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getHNDCourses, getHNDProjects, getHNDAssignments 
} from '../../services/hndService';
import { HNDCourse, HNDProject, HNDAssignment } from '../../types/hnd';
import { Card, Button, Badge, Skeleton, cn } from '../ui';
import { useNavigate } from 'react-router-dom';

export default function HNDLearnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<HNDCourse[]>([]);
  const [projects, setProjects] = useState<HNDProject[]>([]);
  const [assignments, setAssignments] = useState<HNDAssignment[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.hndProgrammeId) return;
      
      setLoading(true);
      try {
        const [fetchedCourses, fetchedProjects, fetchedAssignments] = await Promise.all([
          getHNDCourses({
            programmeId: user.hndProgrammeId,
            level: user.hndLevel,
            semester: user.hndSemester
          }),
          getHNDProjects({
            programmeId: user.hndProgrammeId,
            level: user.hndLevel
          }),
          getHNDAssignments({
            programmeId: user.hndProgrammeId,
            level: user.hndLevel,
            semester: user.hndSemester,
            activeOnly: true
          })
        ]);

        // Filter courses to only show enrolled ones if specific IDs are present
        const enrolledCourses = user.hndEnrolledCourseIds && user.hndEnrolledCourseIds.length > 0
          ? fetchedCourses.filter(c => user.hndEnrolledCourseIds?.includes(c.id))
          : fetchedCourses;

        setCourses(enrolledCourses);
        setProjects(fetchedProjects);
        setAssignments(fetchedAssignments);
      } catch (error) {
        console.error('Error loading HND dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate upcoming deadlines (within 7 days)
  const now = new Date();
  const upcomingAssignments = assignments.filter(a => {
    const dueDate = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
    const diff = dueDate.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-12">
      {/* 1. Quick Stats & Progress */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Modules</p>
            <p className="text-2xl font-black text-slate-900">{courses.length}</p>
          </div>
        </Card>

        <Card className="p-6 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Credits</p>
            <p className="text-2xl font-black text-slate-900">
              {courses.reduce((sum, c) => sum + (c.creditValue || 0), 0)}
            </p>
          </div>
        </Card>

        <Card className="p-6 border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Assignments</p>
            <p className="text-2xl font-black text-slate-900">{assignments.length}</p>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Enrolled Modules List */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="text-indigo-600" size={24} />
              Semester Modules
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hnd/curriculum')} className="font-bold text-indigo-600">
              View All <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => (
              <Card 
                key={course.id} 
                className="p-5 border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/hnd/course/${course.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="neutral" className="text-[9px] font-black uppercase tracking-widest">
                    {course.code}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-400">{course.creditValue} Credits</span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {course.name}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  In Progress
                </div>
              </Card>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No modules enrolled for this semester yet.</p>
                <Button variant="outline" size="sm" className="mt-4 font-black" onClick={() => navigate('/hnd/enrollment')}>
                  Enroll Now
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 3. Upcoming Deadlines */}
        <aside>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
            <Calendar className="text-rose-600" size={24} />
            Deadlines
          </h2>
          <Card className="p-6 border-slate-100">
            <div className="space-y-6">
              {assignments.length > 0 ? (
                assignments.map(assignment => {
                  const dueDate = assignment.dueDate?.toDate ? assignment.dueDate.toDate() : new Date(assignment.dueDate);
                  const isUpcoming = (dueDate.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <div key={assignment.id} className="flex gap-4 group cursor-pointer">
                      <div className={cn(
                        "w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center font-black text-[10px] uppercase",
                        isUpcoming ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                      )}>
                        <span>{dueDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg leading-none">{dueDate.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {assignment.title}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {assignment.courseCode} • {assignment.totalMarks} Marks
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active assignments</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-8 font-black rounded-xl border-slate-200" onClick={() => navigate('/hnd/assignments')}>
              View All Assignments
            </Button>
          </Card>
        </aside>
      </div>

      {/* 4. Practical Projects & Research */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-amber-600" size={24} />
            Practical Projects
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/hnd/projects')} className="font-bold text-indigo-600">
            Explore Repository <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="p-6 border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest">
                  {project.status}
                </Badge>
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <FileText size={16} />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3rem]">
                {project.title}
              </h3>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                  {project.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{project.authorName}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Researcher</p>
                </div>
              </div>
            </Card>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">No projects available for your specialization.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
