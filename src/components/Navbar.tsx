import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { KienTreLogo } from './KienTreLogo';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  LogOut,
  Database,
  RotateCcw,
  FileSpreadsheet,
  ShieldCheck,
  User,
  Terminal,
  ArrowRightLeft,
  SlidersHorizontal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    switchRoleForDemo,
    resetAllData,
    setActiveTab,
    activeTab,
    sidebarPosition,
    setSidebarPosition,
  } = useApp();
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);

  if (!currentUser) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-3 md:px-6 py-2">
          {/* Zone 1: Logo & Brand wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left focus:outline-none cursor-pointer"
              title="Về Trang chủ KIẾN TRẺ EDU"
            >
              <KienTreLogo variant="horizontal" size="md" theme="dark" />
            </button>
          </div>

          {/* Zone 2: Navigation / Quick System Tools */}
          <div className="hidden xl:flex items-center gap-2 text-xs shrink-0">
            {/* Role Badge Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500">Vai trò:</span>
              <span className="font-bold text-slate-800">
                {currentUser.VaiTro === 'Admin'
                  ? 'Quản trị viên (Admin)'
                  : currentUser.VaiTro === 'GiaoVu'
                  ? 'Giáo vụ Đào tạo'
                  : currentUser.VaiTro === 'KeToan'
                  ? 'Kế toán Tài chính'
                  : 'Giảng viên'}
              </span>
            </div>

            {/* SQL Server Data Workbench Button (Admin Only) */}
            {currentUser.VaiTro === 'Admin' && (
              <button
                onClick={() => setShowSqlWorkbench(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 hover:border-emerald-400 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                title="Mở SQL Server Workbench: Xem bảng, chạy câu lệnh T-SQL, xuất .sql"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>SQL Server</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Báo cáo</span>
            </button>

            {/* BCNF Diagram Button (Admin Only) */}
            {currentUser.VaiTro === 'Admin' && (
              <button
                onClick={() => setActiveTab('database_info')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'database_info'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Sơ đồ BCNF</span>
              </button>
            )}

            {currentUser.VaiTro === 'Admin' && (
              <button
                onClick={() => {
                  if (window.confirm('Đặt lại tất cả dữ liệu về mặc định ban đầu (100+ bản ghi)?')) {
                    resetAllData();
                  }
                }}
                title="Khôi phục dữ liệu mẫu ban đầu"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">Reset</span>
              </button>
            )}
          </div>

          {/* Zone 3: Account info, Position Switch & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sidebar Position Toggle Button */}
            <button
              onClick={() => setSidebarPosition(sidebarPosition === 'left' ? 'right' : 'left')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
              title={`Chuyển thanh menu chính sang bên ${sidebarPosition === 'left' ? 'Phải' : 'Trái'}`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">
                Menu: <b>{sidebarPosition === 'left' ? 'Trái' : 'Phải'}</b>
              </span>
            </button>

            {/* Mobile/Tablet tools trigger */}
            <button
              onClick={() => setShowMobileTools(!showMobileTools)}
              className="xl:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Công cụ hệ thống"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-right hidden sm:block max-w-[150px]">
                <div className="text-xs font-semibold text-slate-900 leading-tight truncate">
                  {currentUser.TenNV}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 inline shrink-0" />
                  <span className="truncate">{currentUser.VaiTro}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Tools Row */}
        {showMobileTools && (
          <div className="xl:hidden px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500">Vai trò:</span>
              <span className="font-bold text-slate-800">{currentUser.VaiTro}</span>
            </div>

            {currentUser.VaiTro === 'Admin' && (
              <button
                onClick={() => {
                  setShowSqlWorkbench(true);
                  setShowMobileTools(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold"
              >
                <Terminal className="w-3 h-3 text-emerald-600" />
                <span>SQL Workbench</span>
              </button>
            )}

            <button
              onClick={() => {
                setSidebarPosition(sidebarPosition === 'left' ? 'right' : 'left');
                setShowMobileTools(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <ArrowRightLeft className="w-3 h-3 text-slate-500" />
              <span>Menu: {sidebarPosition === 'left' ? 'Bên Phải' : 'Bên Trái'}</span>
            </button>
          </div>
        )}
      </header>

      {/* SQL Server Modal Launcher */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="HocVien"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </>
  );
};
