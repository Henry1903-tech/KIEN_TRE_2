import React, { useState } from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  School,
  CalendarDays,
  Users,
  ClipboardPenLine,
  Receipt,
  CalendarCheck2,
  Award,
  Building2,
  BellRing,
  UserCog,
  FileSpreadsheet,
  Database,
  Wallet,
  FileCheck,
  GraduationCap,
  ArrowRightLeft,
  ShieldCheck,
  User,
  CreditCard,
  PauseCircle,
  Search,
} from 'lucide-react';

interface MenuItem {
  tab: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
  badge?: string;
}

interface MenuGroup {
  groupCode: string;
  groupName: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    groupCode: 'A',
    groupName: 'A. Quản trị',
    items: [
      {
        tab: 'login_account',
        label: 'Tài khoản cá nhân',
        icon: User,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan', 'GiangVien'],
      },
      {
        tab: 'rbac',
        label: 'Phân quyền người dùng',
        icon: ShieldCheck,
        allowedRoles: ['Admin'],
        badge: 'Admin',
      },
      {
        tab: 'staff',
        label: 'Quản lý nhân viên / Giảng viên',
        icon: UserCog,
        allowedRoles: ['Admin', 'GiaoVu'],
      },
      {
        tab: 'branches',
        label: 'Quản lý chi nhánh',
        icon: Building2,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan'],
      },
    ],
  },
  {
    groupCode: 'B',
    groupName: 'B. Kinh doanh & Đào tạo',
    items: [
      {
        tab: 'crm_leads',
        label: 'Khách hàng tiềm năng & KM',
        icon: TrendingUp,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan'],
      },
      {
        tab: 'courses',
        label: 'Quản lý khóa học',
        icon: BookOpen,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan', 'GiangVien'],
      },
      {
        tab: 'students',
        label: 'Quản lý học viên',
        icon: Users,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan', 'GiangVien'],
      },
      {
        tab: 'classes',
        label: 'Quản lý lớp học',
        icon: School,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan', 'GiangVien'],
      },
      {
        tab: 'enrollment',
        label: 'Ghi danh học viên',
        icon: ClipboardPenLine,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan'],
      },
      {
        tab: 'training_contract',
        label: 'Hợp đồng đào tạo',
        icon: FileCheck,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan'],
      },
      {
        tab: 'payment',
        label: 'Thanh toán học phí',
        icon: Receipt,
        allowedRoles: ['Admin', 'KeToan', 'GiaoVu'],
      },
      {
        tab: 'debt',
        label: 'Công nợ học phí',
        icon: CreditCard,
        allowedRoles: ['Admin', 'KeToan', 'GiaoVu'],
      },
      {
        tab: 'cash_flow',
        label: 'Thu – chi quỹ',
        icon: Wallet,
        allowedRoles: ['Admin', 'KeToan', 'GiaoVu'],
      },
    ],
  },
  {
    groupCode: 'C',
    groupName: 'C. Đào tạo & Khảo thí',
    items: [
      {
        tab: 'placement_tests',
        label: 'Thi đầu vào',
        icon: GraduationCap,
        allowedRoles: ['Admin', 'GiaoVu', 'GiangVien'],
      },
      {
        tab: 'schedules',
        label: 'Lịch học / Lịch dạy',
        icon: CalendarDays,
        allowedRoles: ['Admin', 'GiaoVu', 'GiangVien'],
      },
      {
        tab: 'attendance',
        label: 'Điểm danh',
        icon: CalendarCheck2,
        allowedRoles: ['Admin', 'GiaoVu', 'GiangVien'],
      },
      {
        tab: 'grades',
        label: 'Kết quả học tập / Điểm',
        icon: Award,
        allowedRoles: ['Admin', 'GiaoVu', 'GiangVien'],
      },
      {
        tab: 'certificates',
        label: 'Chứng chỉ tốt nghiệp',
        icon: FileCheck,
        allowedRoles: ['Admin', 'GiaoVu', 'GiangVien'],
      },
      {
        tab: 'deferral',
        label: 'Bảo lưu khóa học',
        icon: PauseCircle,
        allowedRoles: ['Admin', 'GiaoVu'],
      },
      {
        tab: 'transfer',
        label: 'Chuyển lớp',
        icon: ArrowRightLeft,
        allowedRoles: ['Admin', 'GiaoVu'],
      },
    ],
  },
  {
    groupCode: 'D',
    groupName: 'D. Hệ thống & Báo cáo',
    items: [
      {
        tab: 'notifications',
        label: 'Thông báo',
        icon: BellRing,
        allowedRoles: ['Admin', 'GiaoVu'],
      },
      {
        tab: 'dashboard',
        label: 'Dashboard tổng quan',
        icon: LayoutDashboard,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan', 'GiangVien'],
      },
      {
        tab: 'report',
        label: 'Báo cáo – thống kê (Excel/PDF)',
        icon: FileSpreadsheet,
        allowedRoles: ['Admin', 'GiaoVu', 'KeToan', 'GiangVien'],
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, sidebarPosition, setSidebarPosition } = useApp();
  const [filterKeyword, setFilterKeyword] = useState('');

  if (!currentUser) return null;

  return (
    <aside
      className={`w-64 shrink-0 bg-slate-900 text-slate-300 sticky top-[57px] h-[calc(100vh-57px)] flex flex-col justify-between select-none z-20 ${
        sidebarPosition === 'right' ? 'border-l' : 'border-r'
      } border-slate-800`}
    >
      <div className="py-2.5 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-800">
        {/* Brand Header */}
        <div className="px-4 pb-2.5 mb-2 border-b border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">
            Hệ thống Quản trị & Đào tạo
          </div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">KIẾN TRẺ EDUCATION</span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="px-3 mb-2.5">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filterKeyword}
              onChange={e => setFilterKeyword(e.target.value)}
              placeholder="Tìm kiếm phân hệ..."
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* 4 Groups: A. Quản trị, B. Kinh doanh, C. Đào tạo, D. Hệ thống */}
        <div className="space-y-3 px-2">
          {MENU_GROUPS.map(group => {
            const accessibleItems = group.items.filter(item => {
              const matchesRole = item.allowedRoles.includes(currentUser.VaiTro);
              const matchesSearch =
                !filterKeyword.trim() ||
                item.label.toLowerCase().includes(filterKeyword.toLowerCase());
              return matchesRole && matchesSearch;
            });

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.groupCode} className="space-y-0.5">
                <div className="px-3 py-1 text-[11px] font-extrabold tracking-wide text-slate-300 uppercase flex items-center justify-between border-b border-slate-800/40 pb-1 mb-1">
                  <span>{group.groupName}</span>
                  <span className="text-[9px] text-slate-500 font-mono">({accessibleItems.length})</span>
                </div>

                {accessibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    activeTab === item.tab ||
                    (item.tab === 'deferral' && activeTab === 'transfer_deferral') ||
                    (item.tab === 'transfer' && activeTab === 'transfer_deferral');

                  return (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isActive
                              ? 'bg-white text-blue-800'
                              : 'bg-slate-800 text-cyan-400 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Database reference */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('database_info')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                activeTab === 'database_info'
                  ? 'bg-purple-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Kiến trúc CSDL BCNF</span>
              </div>
              <span className="text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-1 rounded">
                SQL
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-2 bg-slate-950/60">
        <button
          type="button"
          onClick={() => setSidebarPosition(sidebarPosition === 'left' ? 'right' : 'left')}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-[11px] font-medium border border-slate-700/70 transition cursor-pointer"
          title={`Chuyển thanh menu chính sang bên ${sidebarPosition === 'left' ? 'Phải' : 'Trái'}`}
        >
          <span>Vị trí menu: <b>{sidebarPosition === 'left' ? 'Bên Trái' : 'Bên Phải'}</b></span>
          <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-blue-400 font-mono">
            {sidebarPosition === 'left' ? 'Đổi sang Phải ➔' : '⬅ Đổi sang Trái'}
          </span>
        </button>

        <div className="space-y-0.5 pt-0.5 border-t border-slate-800/60">
          <div className="font-semibold text-slate-200">Công ty CP Đầu tư Giáo dục KIẾN TRẺ</div>
          <div>Hệ thống 8 Cơ sở (TP.HCM, Hà Nội & Đà Nẵng) · 2024 - 2026</div>
        </div>
      </div>
    </aside>
  );
};
