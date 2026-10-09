import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MONTHLY_REVENUE_CHART } from '../data/initialData';
import { formatVND, formatDate } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import { FinancialChart } from './FinancialChart';
import {
  TrendingUp,
  Users,
  School,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  CreditCard,
  Filter,
  Terminal,
  BookOpen,
  CalendarDays,
  CalendarCheck2,
  Award,
  GraduationCap,
  Clock,
  Building2,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  PieChart,
  BarChart3,
  Receipt,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenReportModal: () => void;
  onSelectStudentForPayment?: (maPhieuGhiDanh: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenReportModal,
  onSelectStudentForPayment,
}) => {
  const {
    studentList,
    classList,
    invoiceList,
    enrollmentList,
    leadList,
    courseList,
    paymentList,
    cashFlowList,
    placementTestList,
    scheduleList,
    attendanceList,
    gradeList,
    certificateList,
    transferDeferralList,
    notificationList,
    staffList,
    branchList,
    currentUser,
    setActiveTab,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('10/2026');
  const [chartYear, setChartYear] = useState<'ALL' | '2026' | '2025' | '2024'>('ALL');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<'all' | 'training' | 'finance'>('all');

  // Filter invoices reactively based on selected period
  const periodInvoices = useMemo(() => {
    return invoiceList.filter(inv => {
      if (selectedMonth === 'all') return true;
      if (selectedMonth === 'year_2026') return inv.NgayHoaDon.startsWith('2026');
      if (selectedMonth === 'year_2025') return inv.NgayHoaDon.startsWith('2025');
      if (selectedMonth === 'year_2024') return inv.NgayHoaDon.startsWith('2024');
      if (selectedMonth.includes('/')) {
        const [m, y] = selectedMonth.split('/');
        return inv.NgayHoaDon.startsWith(`${y}-${m}`);
      }
      return true;
    });
  }, [invoiceList, selectedMonth]);

  // Compute live financial metrics
  const periodRevenue = periodInvoices.reduce((acc, cur) => acc + cur.TienThucThu, 0);
  const periodDebt = periodInvoices.reduce((acc, cur) => acc + cur.TienConNo, 0);
  const periodUnpaid = periodInvoices.filter(i => i.TienConNo > 0);
  const totalRevenueAll = invoiceList.reduce((acc, cur) => acc + cur.TienThucThu, 0);
  const totalStudents = studentList.length;
  const classesRecruiting = classList.filter(c => c.TrangThai === 'DangChieuSinh').length;
  const totalEmptySlots = classList.reduce(
    (acc, cur) => acc + Math.max(0, cur.SucChuaToiDa - cur.SoLuongDaDangKy),
    0
  );

  // Cash flow balance
  const totalThu = cashFlowList.filter(c => c.Loai === 'Thu').reduce((s, c) => s + c.SoTien, 0);
  const totalChi = cashFlowList.filter(c => c.Loai === 'Chi').reduce((s, c) => s + c.SoTien, 0);
  const currentCashFund = totalThu - totalChi;

  // Overdue students list
  const overdueStudents = useMemo(() => {
    return invoiceList
      .filter(inv => inv.TienConNo > 0)
      .map(inv => {
        const student = studentList.find(s => s.MaHV === inv.MaHV);
        const enrollment = enrollmentList.find(e => e.MaPhieuGhiDanh === inv.MaPhieuGhiDanh);
        const cls = classList.find(c => c.MaLop === enrollment?.MaLop);
        const daysOverdue = inv.NgayHanTraNo
          ? Math.max(1, Math.floor((new Date().getTime() - new Date(inv.NgayHanTraNo).getTime()) / (1000 * 3600 * 24)))
          : 25;

        return {
          maHoaDon: inv.MaHoaDon,
          maHV: inv.MaHV,
          tenHV: student?.TenHV || 'Học viên',
          soDienThoai: student?.SoDienThoai || '—',
          tenLop: cls?.TenLop || 'Lớp học',
          khoaHoc: cls?.MaKH || 'Tiếng Anh',
          tongTien: inv.TongTien,
          conNo: inv.TienConNo,
          ngayQuaHan: `${daysOverdue} ngày`,
          maPhieuGhiDanh: inv.MaPhieuGhiDanh,
        };
      });
  }, [invoiceList, studentList, enrollmentList, classList]);

  // Filter 34-month chart data
  const displayedChartData = useMemo(() => {
    if (chartYear === '2026') return MONTHLY_REVENUE_CHART.filter(m => m.thang.endsWith('/26'));
    if (chartYear === '2025') return MONTHLY_REVENUE_CHART.filter(m => m.thang.endsWith('/25'));
    if (chartYear === '2024') return MONTHLY_REVENUE_CHART.filter(m => m.thang.endsWith('/24'));
    return MONTHLY_REVENUE_CHART;
  }, [chartYear]);

  const maxRevenue = Math.max(...displayedChartData.map(m => m.doanhThu), 1);
  const rev2024 = MONTHLY_REVENUE_CHART.filter(m => m.thang.endsWith('/24')).reduce((s, m) => s + m.doanhThu, 0);
  const rev2025 = MONTHLY_REVENUE_CHART.filter(m => m.thang.endsWith('/25')).reduce((s, m) => s + m.doanhThu, 0);
  const rev2026 = MONTHLY_REVENUE_CHART.filter(m => m.thang.endsWith('/26')).reduce((s, m) => s + m.doanhThu, 0);
  const revAll3Years = rev2024 + rev2025 + rev2026;

  // Course distribution calculation (Educational chart)
  const courseStats = useMemo(() => {
    const counts: Record<string, number> = {};
    enrollmentList.forEach(e => {
      if (e.TrangThai === 'Huy') return;
      const cls = classList.find(c => c.MaLop === e.MaLop);
      const courseId = cls?.MaKH || 'Khác';
      counts[courseId] = (counts[courseId] || 0) + 1;
    });

    const colors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-violet-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-teal-600',
      'bg-cyan-600',
    ];

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return courseList.map((c, idx) => {
      const count = counts[c.MaKH] || 0;
      const percent = Math.round((count / total) * 100);
      return {
        course: c,
        count,
        percent,
        color: colors[idx % colors.length],
      };
    }).sort((a, b) => b.count - a.count);
  }, [enrollmentList, classList, courseList]);

  // Branch revenue and distribution for donut and analytics chart
  const branchChartData = useMemo(() => {
    const branchColors = ['#2563eb', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];
    return branchList.map((branch, idx) => {
      const branchClassIds = new Set(classList.filter(c => c.MaChiNhanh === branch.MaChiNhanh).map(c => c.MaLop));
      const branchEnrollmentCodes = new Set(enrollmentList.filter(e => branchClassIds.has(e.MaLop)).map(e => e.MaPhieuGhiDanh));
      const collected = invoiceList.filter(inv => branchEnrollmentCodes.has(inv.MaPhieuGhiDanh)).reduce((s, i) => s + i.TienThucThu, 0);
      const students = enrollmentList.filter(e => branchClassIds.has(e.MaLop) && e.TrangThai !== 'Huy').length;

      return {
        maChiNhanh: branch.MaChiNhanh,
        tenChiNhanh: branch.TenChiNhanh,
        doanhThu: collected > 0 ? collected : 450000000 + (idx * 85000000),
        hocVien: students,
        color: branchColors[idx % branchColors.length],
      };
    });
  }, [branchList, classList, enrollmentList, invoiceList]);

  // Lecturer Personal Data
  const myClasses = useMemo(() => {
    if (!currentUser || currentUser.VaiTro !== 'GiangVien') return [];
    return classList.filter(
      c => c.NhanVienDayID === currentUser.MaNV || (c as any).MaGiangVien === currentUser.MaNV
    );
  }, [currentUser, classList]);

  const myClassIds = useMemo(() => new Set(myClasses.map(c => c.MaLop)), [myClasses]);

  const myStudents = useMemo(() => {
    if (myClassIds.size === 0) return [];
    const studentIds = new Set(
      enrollmentList.filter(e => myClassIds.has(e.MaLop) && e.TrangThai !== 'Huy').map(e => e.MaHV)
    );
    return studentList.filter(s => studentIds.has(s.MaHV));
  }, [myClassIds, enrollmentList, studentList]);

  const mySchedules = useMemo(() => {
    if (!currentUser || currentUser.VaiTro !== 'GiangVien') return [];
    return scheduleList.filter(s => s.GiangVienID === currentUser.MaNV || myClassIds.has(s.MaLop));
  }, [currentUser, scheduleList, myClassIds]);

  const pendingGradesCount = useMemo(() => {
    if (myClassIds.size === 0) return 0;
    const enrolledCount = enrollmentList.filter(e => myClassIds.has(e.MaLop) && e.TrangThai !== 'Huy').length;
    const gradedCount = gradeList.filter(g => myClassIds.has(g.MaLop)).length;
    return Math.max(0, enrolledCount - gradedCount);
  }, [myClassIds, enrollmentList, gradeList]);

  const getPeriodLabel = () => {
    if (selectedMonth === 'all') return '3 năm (2024 - 2026)';
    if (selectedMonth === 'year_2026') return 'Cả năm 2026';
    if (selectedMonth === 'year_2025') return 'Cả năm 2025';
    if (selectedMonth === 'year_2024') return 'Cả năm 2024';
    return `Tháng ${selectedMonth}`;
  };

  const userRole = currentUser?.VaiTro || 'Admin';

  // =========================================================================
  // VIEW 1: GIẢNG VIÊN (DASHBOARD CÁ NHÂN)
  // =========================================================================
  if (userRole === 'GiangVien') {
    return (
      <div className="space-y-6">
        {/* Header Giảng viên */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Dashboard Giảng dạy Cá nhân</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Xin chào, Thầy/Cô {currentUser?.TenNV} ({currentUser?.MaNV})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Bộ phận: <span className="font-semibold text-slate-700">{currentUser?.BoPhong}</span> · Theo dõi tiến độ giảng dạy, sĩ số lớp và lịch dạy trong tuần
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('schedules')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Xem Lịch Dạy</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Điểm Danh Ngay</span>
            </button>
          </div>
        </div>

        {/* 4 Thẻ KPI Cá Nhân */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Lớp học phụ trách</span>
              <School className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {myClasses.length} lớp
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-2">
              Đang trực tiếp giảng dạy
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Tổng số học viên của tôi</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {myStudents.length} học viên
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-2">
              Thuộc các lớp đang phụ trách
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Ca dạy tuần này</span>
              <CalendarDays className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {mySchedules.length} ca học
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-2">
              Thời khóa biểu hoạt động
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Điểm số cần nhập</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono">
              {pendingGradesCount} học viên
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-2">
              Chờ cập nhật điểm giữa/cuối kỳ
            </div>
          </div>
        </div>

        {/* Thời khóa biểu giảng dạy tuần này */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Thời khóa biểu ca dạy của tôi ({mySchedules.length} ca)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Lịch học trong tuần được phân công tại các cơ sở đào tạo</p>
            </div>
            <button
              onClick={() => setActiveTab('schedules')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
            >
              Xem chi tiết toàn bộ lịch &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Thứ</th>
                  <th className="py-2.5 px-3">Khung giờ</th>
                  <th className="py-2.5 px-3">Lớp học</th>
                  <th className="py-2.5 px-3">Phòng học</th>
                  <th className="py-2.5 px-3">Cơ sở</th>
                  <th className="py-2.5 px-3 text-right">Thao tác nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mySchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      Chưa có ca dạy nào được phân công trong hệ thống. Vui lòng liên hệ bộ phận Giáo vụ.
                    </td>
                  </tr>
                ) : (
                  mySchedules.map(sch => {
                    const cls = classList.find(c => c.MaLop === sch.MaLop);
                    const branch = branchList.find(b => b.MaChiNhanh === sch.MaChiNhanh);
                    return (
                      <tr key={sch.MaLichHoc} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-blue-700">
                          {sch.ThuTrongTuan}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {sch.GioBatDau} - {sch.GioKetThuc}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {cls?.TenLop || sch.MaLop}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {sch.PhongHoc}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {branch?.TenChiNhanh || sch.MaChiNhanh}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setActiveTab('attendance')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition cursor-pointer"
                          >
                            <CalendarCheck2 className="w-3 h-3" />
                            <span>Điểm danh</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danh sách lớp trực tiếp giảng dạy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                <span>Các lớp học đang phụ trách ({myClasses.length} lớp)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Theo dõi sĩ số và cập nhật kết quả học tập cho từng lớp</p>
            </div>
            <button
              onClick={() => setActiveTab('grades')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              Nhập bảng điểm &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myClasses.length === 0 ? (
              <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                Chưa có lớp học nào được phân công giảng dạy cho tài khoản này.
              </div>
            ) : (
              myClasses.map(cls => {
                const enrolledCount = enrollmentList.filter(e => e.MaLop === cls.MaLop && e.TrangThai !== 'Huy').length;
                const course = courseList.find(c => c.MaKH === cls.MaKH);
                const percentFilled = Math.min(100, Math.round((enrolledCount / cls.SucChuaToiDa) * 100));

                return (
                  <div key={cls.MaLop} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{cls.TenLop}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{cls.MaLop} · {course?.TenKH || cls.MaKH}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {cls.TrangThai === 'DangChieuSinh' ? 'Đang tuyển sinh' : cls.TrangThai === 'DaKhaiGiang' ? 'Đang diễn ra' : 'Đã kết thúc'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sĩ số lớp:</span>
                        <span className="font-bold text-slate-800">{enrolledCount} / {cls.SucChuaToiDa} học viên ({percentFilled}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentFilled}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => setActiveTab('attendance')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        Điểm danh
                      </button>
                      <button
                        onClick={() => setActiveTab('grades')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                      >
                        Nhập điểm
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GIÁO VỤ (DASHBOARD ĐÀO TẠO)
  // =========================================================================
  if (userRole === 'GiaoVu') {
    return (
      <div className="space-y-6">
        {/* Header Giáo vụ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold mb-1.5">
              <School className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dashboard Quản trị Đào tạo & Khảo thí</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Phòng Giáo vụ Đào tạo · Điều phối 8 Cơ sở
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi tình hình tuyển sinh, phân bổ khóa học, sĩ số lớp và tiến độ thi khảo thí
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('enrollment')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ghi Danh Mới</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <School className="w-3.5 h-3.5" />
              <span>Mở Lớp Mới</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Báo Cáo Đào Tạo</span>
            </button>
          </div>
        </div>

        {/* 4 Thẻ KPI Đào tạo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Tổng số học viên</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {totalStudents} học viên
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-2">
              Toàn hệ thống 8 cơ sở
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Lớp đang chiêu sinh</span>
              <School className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {classesRecruiting} lớp
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-2">
              Sẵn sàng tiếp nhận học viên
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Chỗ trống còn lại</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {totalEmptySlots} chỗ trống
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-2">
              Khả năng tiếp nhận bổ sung
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Thi đầu vào & Xếp lớp</span>
              <GraduationCap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600 font-mono">
              {placementTestList.length} bài thi
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-2">
              Khảo sát trình độ học viên
            </div>
          </div>
        </div>

        {/* Biểu đồ Phân bổ Học viên theo Khóa học (Màu sắc tươi sáng, KHÔNG dùng màu xám) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Phân bổ Học viên theo Khóa học (Thị phần Đào tạo)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Số lượng học viên ghi danh vào từng chương trình giảng dạy</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {courseList.length} Khóa học chính quy
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {courseStats.map(stat => (
              <div key={stat.course.MaKH} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded text-[10px]">
                      {stat.course.MaKH}
                    </span>
                    <span className="font-semibold text-slate-900">{stat.course.TenKH}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{stat.count} học viên</span>
                    <span className="font-mono font-bold text-blue-700 min-w-[36px] text-right">{stat.percent}%</span>
                  </div>
                </div>

                {/* Progress bar with distinctive vibrant colors (NO GRAY BARS) */}
                <div className="w-full bg-blue-50 h-2.5 rounded-full overflow-hidden border border-blue-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${stat.color}`}
                    style={{ width: `${Math.max(5, stat.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bảng Lớp học đang chiêu sinh & Tình hình sĩ số */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-600" />
                <span>Tình hình Tuyển sinh & Sĩ số các lớp học ({classList.length} lớp)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Quản lý sức chứa tối đa và theo dõi tiến độ lấp đầy chỗ trống</p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              Quản lý toàn bộ lớp học &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Mã lớp</th>
                  <th className="py-2.5 px-3">Tên lớp học</th>
                  <th className="py-2.5 px-3">Khóa học</th>
                  <th className="py-2.5 px-3">Cơ sở</th>
                  <th className="py-2.5 px-3">Giảng viên</th>
                  <th className="py-2.5 px-3 text-center">Đã ĐK / Sức chứa</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classList.slice(0, 10).map(cls => {
                  const teacher = staffList.find(s => s.MaNV === cls.NhanVienDayID);
                  const branch = branchList.find(b => b.MaChiNhanh === cls.MaChiNhanh);
                  const enrolledCount = enrollmentList.filter(e => e.MaLop === cls.MaLop && e.TrangThai !== 'Huy').length;
                  const isFull = enrolledCount >= cls.SucChuaToiDa;

                  return (
                    <tr key={cls.MaLop} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {cls.MaLop}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {cls.TenLop}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {cls.MaKH}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {branch?.TenChiNhanh || cls.MaChiNhanh}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {teacher?.TenNV || 'Chưa phân công'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {enrolledCount} / {cls.SucChuaToiDa}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {cls.TrangThai === 'DangChieuSinh' ? 'Tuyển sinh' : 'Đang học'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setActiveTab('enrollment')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition cursor-pointer"
                        >
                          Ghi danh
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: KẾ TOÁN (DASHBOARD TÀI CHÍNH)
  // =========================================================================
  if (userRole === 'KeToan') {
    return (
      <div className="space-y-6">
        {/* Header Kế toán */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dashboard Tài chính & Kế toán</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Kế toán Tài chính · Quản lý Thu chi & Công nợ Học phí
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi dòng tiền, thu học phí qua VietQR/Tiền mặt và đối soát công nợ 8 cơ sở
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Kỳ:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="10/2026">Tháng 10/2026</option>
                <option value="09/2026">Tháng 09/2026</option>
                <option value="08/2026">Tháng 08/2026</option>
                <option value="year_2026">Năm 2026</option>
                <option value="all">Toàn bộ 3 năm</option>
              </select>
            </div>

            <button
              onClick={() => setActiveTab('payment')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Lập Phiếu Thu</span>
            </button>
            <button
              onClick={() => setActiveTab('debt')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Quản Lý Công Nợ</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Báo Cáo Tài Chính</span>
            </button>
          </div>
        </div>

        {/* 4 Thẻ KPI Tài chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Thực thu ({getPeriodLabel()})</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              {formatVND(periodRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{periodInvoices.length} hóa đơn phát sinh</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Công nợ học phí ({getPeriodLabel()})</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-bold text-rose-600 font-mono tracking-tight">
              {formatVND(periodDebt)}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-2">
              {periodUnpaid.length} học viên chưa tất toán
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Quỹ tồn (Thu – Chi)</span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tracking-tight">
              {formatVND(currentCashFund)}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-2">
              Dòng tiền thực tế tại quỹ
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <span>Giao dịch thanh toán</span>
              <Receipt className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              {paymentList.length} giao dịch
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-2">
              Lịch sử giao dịch bất biến
            </div>
          </div>
        </div>

        {/* Financial Multi-Chart Analytics Engine - Chọn nhiều dạng biểu đồ / Khuyên dùng cho Tài chính */}
        <FinancialChart
          data={MONTHLY_REVENUE_CHART}
          branchData={branchChartData}
          title="Phân tích Doanh thu & Tăng trưởng Tài chính (Kế toán)"
          subtitle="Tùy chọn 6 dạng biểu đồ (Combo CFO, Cột, Xu hướng, Vùng dồn tích, Thực thu vs Nợ, Donut %)"
          defaultType="combo"
          accentColor="emerald"
        />

        {/* Bảng Học viên Nợ Học phí Quá hạn */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Danh sách Học viên nợ học phí quá hạn ({overdueStudents.length} hồ sơ)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Cần liên hệ nhắc nợ và thu hồi học phí kịp thời</p>
            </div>
            <button
              onClick={() => setActiveTab('debt')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              Chi tiết công nợ &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Mã HĐ</th>
                  <th className="py-2.5 px-3">Học viên</th>
                  <th className="py-2.5 px-3">SĐT</th>
                  <th className="py-2.5 px-3">Lớp học</th>
                  <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                  <th className="py-2.5 px-3 text-right">Còn nợ</th>
                  <th className="py-2.5 px-3 text-center">Quá hạn</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {overdueStudents.map(st => (
                  <tr key={st.maHoaDon} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.maHoaDon}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{st.tenHV} ({st.maHV})</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{st.soDienThoai}</td>
                    <td className="py-2.5 px-3 text-slate-800">{st.tenLop}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">{formatVND(st.tongTien)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">{formatVND(st.conNo)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold">
                        {st.ngayQuaHan}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (onSelectStudentForPayment) {
                            onSelectStudentForPayment(st.maPhieuGhiDanh);
                          } else {
                            setActiveTab('payment');
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Thu nợ</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: ADMIN (TOÀN BỘ HỆ THỐNG)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Filter Bar Admin */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Dashboard Quản trị Điều hành (Toàn bộ)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tổng quan Hoạt động Toàn hệ thống KIẾN TRẺ EDU
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mạng lưới 8 cơ sở toàn quốc · Dữ liệu thời gian thực cập nhật từ CSDL Microsoft SQL Server
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Admin Perspective Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setAdminViewMode('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                adminViewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn bộ
            </button>
            <button
              onClick={() => setAdminViewMode('training')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                adminViewMode === 'training'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đào tạo
            </button>
            <button
              onClick={() => setAdminViewMode('finance')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                adminViewMode === 'finance'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tài chính
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="10/2026">Tháng 10/2026</option>
              <option value="09/2026">Tháng 09/2026</option>
              <option value="08/2026">Tháng 08/2026</option>
              <option value="year_2026">Năm 2026</option>
              <option value="all">Toàn bộ 3 năm</option>
            </select>
          </div>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Mở bảng điều khiển SQL Server Workbench và kiểm tra dữ liệu T-SQL"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ KPI Master */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Doanh thu ({getPeriodLabel()})</span>
            <span className="text-emerald-700 font-semibold flex items-center text-[11px]">
              +18.4%
              <ArrowUpRight className="w-3 h-3 inline" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
            {formatVND(periodRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>{periodInvoices.length} hóa đơn trong kỳ</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tổng học viên toàn hệ thống</span>
            <span className="text-blue-700 font-semibold text-[11px]">8 cơ sở</span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
            {totalStudents} học viên
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-600" />
            <span>Phân bổ mạng lưới 8 chi nhánh</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Lớp đang chiêu sinh</span>
            <span className="text-indigo-700 font-semibold text-[11px]">Sẵn sàng</span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
            {classesRecruiting} lớp
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <School className="w-3 h-3 text-indigo-600" />
            <span>Còn {totalEmptySlots} chỗ trống tuyển sinh</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Công nợ học phí ({getPeriodLabel()})</span>
            <span className="text-rose-700 font-semibold text-[11px]">
              {periodUnpaid.length} hồ sơ
            </span>
          </div>
          <div className="text-xl font-bold text-rose-600 font-mono tracking-tight tabular-nums">
            {formatVND(periodDebt)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Cần đối soát và nhắc nợ học phí</span>
          </div>
        </div>
      </div>

      {/* Khối Đào tạo (Hiển thị khi view mode là 'all' hoặc 'training') */}
      {(adminViewMode === 'all' || adminViewMode === 'training') && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Phân bổ Học viên theo Khóa học (Thị phần Đào tạo)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Số lượng học viên ghi danh vào từng chương trình giảng dạy</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {courseList.length} Khóa học
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {courseStats.map(stat => (
              <div key={stat.course.MaKH} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded text-[10px]">
                      {stat.course.MaKH}
                    </span>
                    <span className="font-semibold text-slate-900">{stat.course.TenKH}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{stat.count} học viên</span>
                    <span className="font-mono font-bold text-blue-700 min-w-[36px] text-right">{stat.percent}%</span>
                  </div>
                </div>

                <div className="w-full bg-blue-50 h-2 rounded-full overflow-hidden border border-blue-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${stat.color}`}
                    style={{ width: `${Math.max(5, stat.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Khối Tài chính (Hiển thị khi view mode là 'all' hoặc 'finance') - Financial Multi-Chart Analytics */}
      {(adminViewMode === 'all' || adminViewMode === 'finance') && (
        <FinancialChart
          data={MONTHLY_REVENUE_CHART}
          branchData={branchChartData}
          title="Doanh thu học phí & Tăng trưởng Hệ thống (Admin Điều hành)"
          subtitle="Tùy chọn 6 dạng biểu đồ (Combo CFO, Cột, Xu hướng, Vùng dồn tích, Thực thu vs Nợ, Donut 8 cơ sở)"
          defaultType="combo"
          accentColor="blue"
        />
      )}

      {/* Bảng Nợ học phí */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Học viên nợ học phí quá hạn ({overdueStudents.length} hồ sơ)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Danh sách các hóa đơn quá hạn cần đôn đốc thanh toán</p>
          </div>
          <button
            onClick={() => setActiveTab('debt')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Xem tất cả công nợ &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Mã HĐ</th>
                <th className="py-2.5 px-3">Mã HV</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">SĐT</th>
                <th className="py-2.5 px-3">Lớp học</th>
                <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                <th className="py-2.5 px-3 text-right">Còn nợ</th>
                <th className="py-2.5 px-3 text-center">Quá hạn</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {overdueStudents.map(st => (
                <tr key={st.maHoaDon} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.maHoaDon}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{st.maHV}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{st.tenHV}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{st.soDienThoai}</td>
                  <td className="py-2.5 px-3 text-slate-800">{st.tenLop}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900">{formatVND(st.tongTien)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">{formatVND(st.conNo)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold">
                      {st.ngayQuaHan}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onSelectStudentForPayment) {
                          onSelectStudentForPayment(st.maPhieuGhiDanh);
                        } else {
                          setActiveTab('payment');
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Thu nợ</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="HoaDon"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
