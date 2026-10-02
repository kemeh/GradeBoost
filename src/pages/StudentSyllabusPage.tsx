import React from 'react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import StudentSyllabusDashboard from '../components/syllabus/StudentSyllabusDashboard';

export default function StudentSyllabusPage() {
  return (
    <ModernDashboardLayout>
      <StudentSyllabusDashboard />
    </ModernDashboardLayout>
  );
}
