import React from 'react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import AdminPastPapersManagement from '../components/admin/AdminPastPapersManagement';

export default function AdminPastPapers() {
  return (
    <ModernDashboardLayout role="admin" activeTab="papers">
      <AdminPastPapersManagement />
    </ModernDashboardLayout>
  );
}
