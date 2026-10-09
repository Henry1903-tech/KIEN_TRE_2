import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginForm } from './components/LoginForm';
import { DashboardView } from './components/DashboardView';
import { CrmLeadManager } from './components/CrmLeadManager';
import { CourseManager } from './components/CourseManager';
import { ClassManager } from './components/ClassManager';
import { ScheduleManager } from './components/ScheduleManager';
import { StudentManager } from './components/StudentManager';
import { EnrollmentWizard } from './components/EnrollmentWizard';
import { AttendanceManager } from './components/AttendanceManager';
import { GradeManager } from './components/GradeManager';
import { PaymentManager } from './components/PaymentManager';
import { BranchManager } from './components/BranchManager';
import { NotificationManager } from './components/NotificationManager';
import { EmployeeManager } from './components/EmployeeManager';
import { DatabaseInfoView } from './components/DatabaseInfoView';
import { PlacementTestManager } from './components/PlacementTestManager';
import { TransferDeferralManager } from './components/TransferDeferralManager';
import { CashFlowManager } from './components/CashFlowManager';
import { TrainingContractManager } from './components/TrainingContractManager';
import { AccountSessionView } from './components/AccountSessionView';
import { RbacManager } from './components/RbacManager';
import { DebtManager } from './components/DebtManager';
import { CertificateManager } from './components/CertificateManager';
import { ReportAnalyticsView } from './components/ReportAnalyticsView';
import { ReportModal } from './components/ReportModal';
import { ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, sidebarPosition } = useApp();
  const [showReportModal, setShowReportModal] = useState(false);
  const [prefilledEnrollmentForPayment, setPrefilledEnrollmentForPayment] = useState<string>('');

  if (!currentUser) {
    return <LoginForm />;
  }

  // RBAC Permission Check across all modules according to security policy
  const checkPermission = (): boolean => {
    const role = currentUser.VaiTro;
    switch (activeTab) {
      case 'dashboard':
      case 'login_account':
      case 'report':
        return true;
      case 'rbac':
        return role === 'Admin';
      case 'database_info':
        return role === 'Admin';
      case 'staff':
        return role === 'Admin' || role === 'GiaoVu';
      case 'branches':
        return role === 'Admin' || role === 'GiaoVu' || role === 'KeToan';
      case 'crm_leads':
      case 'training_contract':
        return role === 'Admin' || role === 'GiaoVu' || role === 'KeToan';
      case 'courses':
      case 'students':
      case 'classes':
        return true;
      case 'enrollment':
        return role === 'Admin' || role === 'GiaoVu' || role === 'KeToan';
      case 'payment':
      case 'debt':
      case 'cash_flow':
        return role === 'Admin' || role === 'KeToan' || role === 'GiaoVu';
      case 'schedules':
      case 'attendance':
      case 'grades':
      case 'placement_tests':
      case 'certificates':
        return role === 'Admin' || role === 'GiaoVu' || role === 'GiangVien';
      case 'deferral':
      case 'transfer':
      case 'transfer_deferral':
        return role === 'Admin' || role === 'GiaoVu';
      case 'notifications':
        return role === 'Admin' || role === 'GiaoVu';
      default:
        return true;
    }
  };

  const hasAccess = checkPermission();

  const handleNavigateToPayment = (maPhieuGhiDanh: string) => {
    setPrefilledEnrollmentForPayment(maPhieuGhiDanh);
    setActiveTab('payment');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {sidebarPosition === 'left' && <Sidebar />}

        <main id="main-content-scroll" className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
          {!hasAccess ? (
            <div className="p-8 bg-white border border-rose-200 rounded-xl text-center space-y-3 shadow-xs my-8">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Không đủ quyền truy cập (RBAC Restriction)
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Tài khoản của bạn có vai trò <span className="font-bold text-rose-600">{currentUser.VaiTro}</span> ({currentUser.BoPhong}), không được cấp quyền truy cập vào phân hệ này theo chính sách bảo mật của KIẾN TRẺ EDU.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold"
              >
                Về lại Trang chủ
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenReportModal={() => setShowReportModal(true)}
                  onSelectStudentForPayment={handleNavigateToPayment}
                />
              )}

              {activeTab === 'login_account' && <AccountSessionView />}

              {activeTab === 'rbac' && <RbacManager />}

              {activeTab === 'staff' && <EmployeeManager />}

              {activeTab === 'branches' && <BranchManager />}

              {activeTab === 'crm_leads' && <CrmLeadManager />}

              {activeTab === 'courses' && <CourseManager />}

              {activeTab === 'students' && <StudentManager />}

              {activeTab === 'classes' && <ClassManager />}

              {activeTab === 'enrollment' && (
                <EnrollmentWizard
                  onNavigateToPayment={handleNavigateToPayment}
                  onOpenStudentTab={() => setActiveTab('students')}
                />
              )}

              {activeTab === 'training_contract' && <TrainingContractManager />}

              {activeTab === 'payment' && (
                <PaymentManager initialEnrollmentCode={prefilledEnrollmentForPayment} />
              )}

              {activeTab === 'debt' && <DebtManager />}

              {activeTab === 'cash_flow' && <CashFlowManager />}

              {activeTab === 'placement_tests' && <PlacementTestManager />}

              {activeTab === 'schedules' && <ScheduleManager />}

              {activeTab === 'attendance' && <AttendanceManager />}

              {activeTab === 'grades' && <GradeManager />}

              {activeTab === 'certificates' && <CertificateManager />}

              {activeTab === 'deferral' && (
                <TransferDeferralManager initialType="BaoLuu" />
              )}

              {activeTab === 'transfer' && (
                <TransferDeferralManager initialType="ChuyenLop" />
              )}

              {activeTab === 'transfer_deferral' && <TransferDeferralManager initialType="all" />}

              {activeTab === 'notifications' && <NotificationManager />}

              {activeTab === 'report' && <ReportAnalyticsView />}

              {activeTab === 'database_info' && <DatabaseInfoView />}
            </>
          )}
        </main>

        {sidebarPosition === 'right' && <Sidebar />}
      </div>

      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
