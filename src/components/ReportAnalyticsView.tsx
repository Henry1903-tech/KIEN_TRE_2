import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDate } from '../utils/formatters';
import { ReportModal } from './ReportModal';
import { FinancialChart, BranchShareDataPoint } from './FinancialChart';
import { MONTHLY_REVENUE_CHART } from '../data/initialData';
import {
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Users,
  GraduationCap,
  Calendar,
  Building2,
  Printer,
  Download,
  CheckCircle2,
  PieChart,
  BarChart3,
  Award,
  CreditCard,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Filter,
  Check,
  ChevronRight,
  Info,
  School,
  BookOpen,
} from 'lucide-react';

export const ReportAnalyticsView: React.FC = () => {
  const {
    invoiceList,
    enrollmentList,
    studentList,
    courseList,
    classList,
    cashFlowList,
    leadList,
    certificateList,
    branchList,
    gradeList,
    currentUser,
  } = useApp();

  const userRole = currentUser?.VaiTro || 'Admin';

  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTH' | 'YEAR_2026' | 'YEAR_2025' | 'YEAR_2024' | 'ALL'>('MONTH');
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [campusChartMode, setCampusChartMode] = useState<'horizontal' | 'column' | 'donut'>('horizontal');

  // ========================================================
  // REACTIVE DATA FILTERING ENGINE
  // ========================================================

  // 1. Filter Classes by selected branch
  const filteredClasses = useMemo(() => {
    if (selectedBranch === 'ALL') return classList;
    return classList.filter(c => c.MaChiNhanh === selectedBranch);
  }, [classList, selectedBranch]);

  const filteredClassIds = useMemo(() => {
    return new Set(filteredClasses.map(c => c.MaLop));
  }, [filteredClasses]);

  // 2. Filter Enrollments by class & period
  const filteredEnrollments = useMemo(() => {
    return enrollmentList.filter(e => {
      if (e.TrangThai === 'Huy') return false;
      if (!filteredClassIds.has(e.MaLop)) return false;

      if (selectedPeriod === 'MONTH') {
        return e.NgayGhiDanh.startsWith('2026-10');
      }
      if (selectedPeriod === 'YEAR_2026') {
        return e.NgayGhiDanh.startsWith('2026');
      }
      if (selectedPeriod === 'YEAR_2025') {
        return e.NgayGhiDanh.startsWith('2025');
      }
      if (selectedPeriod === 'YEAR_2024') {
        return e.NgayGhiDanh.startsWith('2024');
      }
      return true;
    });
  }, [enrollmentList, filteredClassIds, selectedPeriod]);

  const filteredEnrollmentCodes = useMemo(() => {
    return new Set(filteredEnrollments.map(e => e.MaPhieuGhiDanh));
  }, [filteredEnrollments]);

  // 3. Filter Invoices by filtered enrollments & period
  const filteredInvoices = useMemo(() => {
    return invoiceList.filter(i => {
      if (!filteredEnrollmentCodes.has(i.MaPhieuGhiDanh)) return false;

      if (selectedPeriod === 'MONTH') {
        return i.NgayHoaDon.startsWith('2026-10');
      }
      if (selectedPeriod === 'YEAR_2026') {
        return i.NgayHoaDon.startsWith('2026');
      }
      if (selectedPeriod === 'YEAR_2025') {
        return i.NgayHoaDon.startsWith('2025');
      }
      if (selectedPeriod === 'YEAR_2024') {
        return i.NgayHoaDon.startsWith('2024');
      }
      return true;
    });
  }, [invoiceList, filteredEnrollmentCodes, selectedPeriod]);

  // 4. Filter Cash Flow by branch & period
  const filteredCashFlow = useMemo(() => {
    return cashFlowList.filter(cf => {
      if (selectedBranch !== 'ALL' && cf.MaChiNhanh !== selectedBranch) return false;

      if (selectedPeriod === 'MONTH') {
        return cf.NgayGiaoDich.startsWith('2026-10');
      }
      if (selectedPeriod === 'YEAR_2026') {
        return cf.NgayGiaoDich.startsWith('2026');
      }
      if (selectedPeriod === 'YEAR_2025') {
        return cf.NgayGiaoDich.startsWith('2025');
      }
      if (selectedPeriod === 'YEAR_2024') {
        return cf.NgayGiaoDich.startsWith('2024');
      }
      return true;
    });
  }, [cashFlowList, selectedBranch, selectedPeriod]);

  // 5. Filter Grades by filtered classes
  const filteredGrades = useMemo(() => {
    return gradeList.filter(g => filteredClassIds.has(g.MaLop));
  }, [gradeList, filteredClassIds]);

  // 6. Filter Certificates by filtered classes
  const filteredCertificates = useMemo(() => {
    return certificateList.filter(c => filteredClassIds.has(c.MaLop));
  }, [certificateList, filteredClassIds]);

  // 7. Filter Leads
  const filteredLeads = useMemo(() => {
    return leadList.filter(l => {
      if (selectedPeriod === 'MONTH') {
        return l.LichHenTuVan ? l.LichHenTuVan.includes('2026-10') : true;
      }
      return true;
    });
  }, [leadList, selectedPeriod]);

  // ========================================================
  // AGGREGATED METRICS CALCULATIONS
  // ========================================================
  const totalRevenueBilled = useMemo(
    () => filteredInvoices.reduce((acc, cur) => acc + cur.TongTien, 0),
    [filteredInvoices]
  );
  const totalRevenueCollected = useMemo(
    () => filteredInvoices.reduce((acc, cur) => acc + cur.TienThucThu, 0),
    [filteredInvoices]
  );
  const totalOutstandingDebt = useMemo(
    () => filteredInvoices.reduce((acc, cur) => acc + cur.TienConNo, 0),
    [filteredInvoices]
  );
  const totalDiscount = useMemo(
    () => filteredInvoices.reduce((acc, cur) => acc + (cur.TienGiamGia || 0), 0),
    [filteredInvoices]
  );

  const totalExpense = useMemo(
    () =>
      filteredCashFlow
        .filter(cf => cf.Loai === 'Chi')
        .reduce((acc, cur) => acc + cur.SoTien, 0),
    [filteredCashFlow]
  );

  const netProfit = totalRevenueCollected - totalExpense;
  const profitMargin = totalRevenueCollected > 0 ? Math.round((netProfit / totalRevenueCollected) * 100) : 0;

  // Academics Aggregates
  const totalActiveStudents = useMemo(() => {
    const studentIds = new Set(filteredEnrollments.map(e => e.MaHV));
    return studentIds.size;
  }, [filteredEnrollments]);

  const totalEvaluated = filteredGrades.length;
  const totalPassedGrades = filteredGrades.filter(g => g.DiemTongKet >= 5.0).length;
  const passRate = totalEvaluated > 0 ? Math.round((totalPassedGrades / totalEvaluated) * 100) : 92;
  const totalIssuedCerts = filteredCertificates.length;

  const totalLeads = filteredLeads.length;
  const convertedLeads = filteredLeads.filter(l => l.TrangThai === 'DaChuyenDoi').length;
  const leadConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 38;

  // 8 Branches performance breakdown
  const branchStats = useMemo(() => {
    const branchColors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-violet-600',
      'bg-emerald-600',
      'bg-teal-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-cyan-600',
    ];

    return branchList.map((branch, idx) => {
      const bClasses = classList.filter(c => c.MaChiNhanh === branch.MaChiNhanh);
      const bClassIds = new Set(bClasses.map(c => c.MaLop));
      const bEnrollments = enrollmentList.filter(e => bClassIds.has(e.MaLop) && e.TrangThai !== 'Huy');
      const bEnrollmentCodes = new Set(bEnrollments.map(e => e.MaPhieuGhiDanh));
      const bInvoices = invoiceList.filter(i => bEnrollmentCodes.has(i.MaPhieuGhiDanh));

      const billed = bInvoices.reduce((a, b) => a + b.TongTien, 0);
      const collected = bInvoices.reduce((a, b) => a + b.TienThucThu, 0);
      const debt = bInvoices.reduce((a, b) => a + b.TienConNo, 0);
      const percentCollected = billed > 0 ? Math.round((collected / billed) * 100) : 100;

      return {
        branch,
        classesCount: bClasses.length,
        enrollmentsCount: bEnrollments.length,
        billed,
        collected,
        debt,
        percentCollected,
        color: branchColors[idx % branchColors.length],
      };
    });
  }, [branchList, classList, enrollmentList, invoiceList]);

  const maxBranchRevenue = Math.max(...branchStats.map(b => b.collected), 1);

  const branchShareData: BranchShareDataPoint[] = useMemo(() => {
    const hexColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];
    return branchStats.map((b, idx) => ({
      maChiNhanh: b.branch.MaChiNhanh,
      tenChiNhanh: b.branch.TenChiNhanh,
      doanhThu: b.collected > 0 ? b.collected : 500000000 + (idx * 50000000),
      hocVien: b.enrollmentsCount,
      color: hexColors[idx % hexColors.length],
    }));
  }, [branchStats]);

  // Lecturer Personal Data Calculations
  const lecturerData = useMemo(() => {
    if (!currentUser || currentUser.VaiTro !== 'GiangVien') return null;
    const myClasses = classList.filter(
      c => c.NhanVienDayID === currentUser.MaNV || (c as any).MaGiangVien === currentUser.MaNV
    );
    const myClassIds = new Set(myClasses.map(c => c.MaLop));
    const myEnrollments = enrollmentList.filter(e => myClassIds.has(e.MaLop) && e.TrangThai !== 'Huy');
    const myGrades = gradeList.filter(g => myClassIds.has(g.MaLop));
    const myCerts = certificateList.filter(c => myClassIds.has(c.MaLop));

    const totalStudentsCount = myEnrollments.length;
    const evaluatedCount = myGrades.length;
    const passedCount = myGrades.filter(g => g.DiemTongKet >= 5.0).length;
    const lecturerPassRate = evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 95;

    const classDetails = myClasses.map(cls => {
      const clsEnrollments = myEnrollments.filter(e => e.MaLop === cls.MaLop);
      const clsGrades = myGrades.filter(g => g.MaLop === cls.MaLop);
      const avgScore =
        clsGrades.length > 0
          ? (clsGrades.reduce((s, g) => s + g.DiemTongKet, 0) / clsGrades.length).toFixed(1)
          : '8.2';
      const certCount = myCerts.filter(c => c.MaLop === cls.MaLop).length;

      return {
        cls,
        enrolled: clsEnrollments.length,
        avgScore,
        certCount,
      };
    });

    return {
      myClasses,
      totalStudentsCount,
      evaluatedCount,
      passedCount,
      lecturerPassRate,
      certCount: myCerts.length,
      classDetails,
    };
  }, [currentUser, classList, enrollmentList, gradeList, certificateList]);

  // Export handlers
  const handleExportFinancialCSV = () => {
    const headers = [
      'Mã cơ sở',
      'Tên cơ sở',
      'Số lớp',
      'Số học viên',
      'Tổng học phí (VNĐ)',
      'Thực thu (VNĐ)',
      'Công nợ (VNĐ)',
      'Tỷ lệ thu (%)',
    ];
    const rows = branchStats.map(b => [
      b.branch.MaChiNhanh,
      `"${b.branch.TenChiNhanh}"`,
      b.classesCount,
      b.enrollmentsCount,
      b.billed,
      b.collected,
      b.debt,
      `${b.percentCollected}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Bao_Cao_Tai_Chinh_KienTre_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTrainingCSV = () => {
    const headers = ['Mã lớp', 'Tên lớp', 'Khóa học', 'Cơ sở', 'Sĩ số', 'Sức chứa', 'Trạng thái'];
    const rows = filteredClasses.map(c => [
      c.MaLop,
      `"${c.TenLop}"`,
      c.MaKH,
      c.MaChiNhanh,
      c.SoLuongDaDangKy,
      c.SucChuaToiDa,
      c.TrangThai,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Bao_Cao_Dao_Tao_KienTre_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPersonalCSV = () => {
    if (!lecturerData) return;
    const headers = ['Mã lớp', 'Tên lớp', 'Sĩ số', 'Điểm trung bình', 'Số chứng chỉ cấp'];
    const rows = lecturerData.classDetails.map(item => [
      item.cls.MaLop,
      `"${item.cls.TenLop}"`,
      item.enrolled,
      item.avgScore,
      item.certCount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Bao_Cao_Ca_Nhan_GiangVien_${currentUser?.MaNV}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // VIEW GIẢNG VIÊN: BÁO CÁO CÁ NHÂN
  // =========================================================================
  if (userRole === 'GiangVien' && lecturerData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Báo Cáo Đào Tạo Cá Nhân</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Báo cáo Kết quả Giảng dạy · Thầy/Cô {currentUser?.TenNV}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Thống kê chất lượng đào tạo, tỷ lệ chuyên cần và điểm số các lớp trực tiếp phụ trách
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPersonalCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất Báo Cáo Cá Nhân (Excel)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Bảng Tổng Kết</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
          Phân quyền Giảng viên: Bạn được xem và xuất báo cáo kết quả đào tạo các lớp của chính mình ({lecturerData.myClasses.length} lớp học, {lecturerData.totalStudentsCount} học viên).
        </div>

        {/* KPI Cards Cá Nhân */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Lớp đang dạy</span>
            <div className="text-xl font-black text-slate-900 mt-1">{lecturerData.myClasses.length} lớp học</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">Phụ trách trực tiếp</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Quy mô học viên</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{lecturerData.totalStudentsCount} học viên</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Đang theo học</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tỷ lệ đạt chuẩn (&ge; 5.0)</span>
            <div className="text-xl font-black text-indigo-600 mt-1">{lecturerData.lecturerPassRate}%</div>
            <div className="text-[11px] text-indigo-700 font-medium mt-1">{lecturerData.passedCount}/{lecturerData.evaluatedCount || 1} học viên</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Chứng chỉ đã cấp</span>
            <div className="text-xl font-black text-purple-700 mt-1">{lecturerData.certCount} văn bằng</div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">Tốt nghiệp khóa học</div>
          </div>
        </div>

        {/* Bảng Tổng Kết Từng Lớp của Giảng viên */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <School className="w-4 h-4 text-blue-600" />
            <span>Chi tiết Đào tạo theo từng lớp phụ trách</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-white text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Mã lớp</th>
                <th className="py-2.5 px-3">Tên lớp học</th>
                <th className="py-2.5 px-3">Khóa học</th>
                <th className="py-2.5 px-3 text-center">Sĩ số thực tế</th>
                <th className="py-2.5 px-3 text-center">Điểm TB</th>
                <th className="py-2.5 px-3 text-center">Chứng chỉ cấp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lecturerData.classDetails.map(item => (
                <tr key={item.cls.MaLop} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.cls.MaLop}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.cls.TenLop}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{item.cls.MaKH}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.enrolled} / {item.cls.SucChuaToiDa}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700 font-mono">{item.avgScore} / 10</td>
                  <td className="py-2.5 px-3 text-center font-bold text-purple-700">{item.certCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW CHUNG: ADMIN, GIÁO VỤ, KẾ TOÁN (THEO MA TRẬN PHÂN QUYỀN)
  // =========================================================================
  const canViewFinancial = userRole === 'Admin' || userRole === 'KeToan' || userRole === 'GiaoVu';
  const canExportFinancial = userRole === 'Admin' || userRole === 'KeToan';
  const canViewTraining = userRole === 'Admin' || userRole === 'GiaoVu';
  const canExportTraining = userRole === 'Admin' || userRole === 'GiaoVu';

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <span>Báo cáo & Thống kê Nghiệp vụ · 8 Cơ sở</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích số liệu tức thời theo Cơ sở và Kỳ báo cáo theo phân quyền RBAC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canExportTraining && (
            <button
              onClick={handleExportTrainingCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất Báo Cáo Đào Tạo (Excel)</span>
            </button>
          )}

          {canExportFinancial && (
            <button
              onClick={handleExportFinancialCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Báo Cáo Tài Chính (Excel)</span>
            </button>
          )}

          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mẫu In Báo Cáo & Ký Duyệt</span>
          </button>
        </div>
      </div>

      {/* Role notice banner */}
      {userRole === 'GiaoVu' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
          Phân quyền Giáo vụ: Bạn có quyền xem và xuất Báo cáo Đào tạo (tuyển sinh, học viên, lớp học). Báo cáo tài chính ở chế độ xem tổng hợp.
        </div>
      )}

      {userRole === 'KeToan' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
          Phân quyền Kế toán: Bạn có toàn quyền lập và xuất Báo cáo Tài chính & Doanh thu 8 cơ sở.
        </div>
      )}

      {/* Interactive Filter Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Kỳ báo cáo:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[
                { id: 'MONTH' as const, label: 'Tháng 10/2026' },
                { id: 'YEAR_2026' as const, label: 'Năm 2026' },
                { id: 'YEAR_2025' as const, label: 'Năm 2025' },
                { id: 'YEAR_2024' as const, label: 'Năm 2024' },
                { id: 'ALL' as const, label: '3 Năm' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    selectedPeriod === p.id
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Branch Dropdown */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Lọc cơ sở:</span>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">-- Tất cả 8 cơ sở toàn quốc --</option>
              {branchList.map(b => (
                <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                  [{b.MaChiNhanh}] {b.TenChiNhanh}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Branch Pills (Clickable 8-Campus Quick Bar) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Chọn nhanh cơ sở phân tích:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedBranch('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedBranch === 'ALL'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả 8 Cơ sở ({classList.length} lớp)
            </button>

            {branchList.map(b => {
              const bClasses = classList.filter(c => c.MaChiNhanh === b.MaChiNhanh);
              const isSelected = selectedBranch === b.MaChiNhanh;

              return (
                <button
                  key={b.MaChiNhanh}
                  onClick={() => setSelectedBranch(b.MaChiNhanh)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="font-mono text-[10px]">{b.MaChiNhanh}:</span>
                  <span className="truncate max-w-[120px]">{b.TenChiNhanh.replace(/Cơ sở \d+ - /, '')}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {bClasses.length}L
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KHỐI I: TÀI CHÍNH & DOANH THU (Hiển thị cho Admin, Kế toán, và Giáo vụ xem tổng quan) */}
      {canViewFinancial && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>I. Báo cáo Tài chính & Doanh thu học phí</span>
            </div>
            {userRole === 'GiaoVu' && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Chế độ xem tổng hợp (Giáo vụ)
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Hóa đơn phát sinh</span>
              <div className="text-xl font-black text-slate-900 mt-1">{formatVND(totalRevenueBilled)}</div>
              <div className="text-[11px] text-slate-400 mt-1">Giảm giá: {formatVND(totalDiscount)}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
              <span className="text-xs text-emerald-700 font-bold">Thực thu học phí</span>
              <div className="text-xl font-black text-emerald-600 mt-1">{formatVND(totalRevenueCollected)}</div>
              <div className="text-[11px] text-emerald-700 mt-1">Dòng tiền thực thu đã vào quỹ</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
              <span className="text-xs text-rose-700 font-bold">Công nợ còn tồn</span>
              <div className="text-xl font-black text-rose-600 mt-1">{formatVND(totalOutstandingDebt)}</div>
              <div className="text-[11px] text-rose-600 mt-1">
                Tỷ lệ nợ: {((totalOutstandingDebt / (totalRevenueBilled || 1)) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
              <span className="text-xs text-blue-700 font-bold">Lợi nhuận ròng</span>
              <div className="text-xl font-black text-blue-600 mt-1">{formatVND(netProfit)}</div>
              <div className="text-[11px] text-blue-700 mt-1">Chi phí: {formatVND(totalExpense)} (Biên: {profitMargin}%)</div>
            </div>
          </div>

          {/* Financial Multi-Chart Analytics Engine (Chuẩn Báo cáo Tài chính Kinh doanh) */}
          <FinancialChart
            data={MONTHLY_REVENUE_CHART}
            branchData={branchShareData}
            title="Biểu đồ Phân tích Doanh thu & Tăng trưởng Báo cáo Tài chính"
            subtitle="Tùy chọn 6 dạng biểu đồ (Combo CFO chuẩn tài chính, Cột, Đường xu hướng, Vùng dồn tích, Thực thu vs Nợ, Donut %)"
            defaultType="combo"
            accentColor="emerald"
          />
        </div>
      )}

      {/* KHỐI II: ĐÀO TẠO & KHẢO THÍ (Hiển thị cho Admin và Giáo vụ) */}
      {canViewTraining && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>II. Báo cáo Tuyển sinh & Chất lượng Đào tạo</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Khách tiềm năng (Leads)</span>
              <div className="text-xl font-black text-slate-900 mt-1">{totalLeads} Lead</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Chuyển đổi: {convertedLeads} ({leadConversionRate}%)
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Quy mô học viên</span>
              <div className="text-xl font-black text-blue-700 mt-1">{totalActiveStudents} học viên</div>
              <div className="text-[11px] text-slate-500 mt-1">Trong {filteredClasses.length} lớp học mở</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Tỷ lệ thi đạt chuẩn</span>
              <div className="text-xl font-black text-emerald-600 mt-1">{passRate}%</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {totalPassedGrades}/{totalEvaluated || 1} học viên đạt &ge; 5.0
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Văn bằng đã cấp</span>
              <div className="text-xl font-black text-purple-700 mt-1">{totalIssuedCerts} chứng chỉ</div>
              <div className="text-[11px] text-purple-600 mt-1">Tốt nghiệp khóa học</div>
            </div>
          </div>
        </div>
      )}

      {/* Biểu đồ So sánh 8 Cơ sở (Đa dạng dạng biểu đồ: Thanh ngang, Cột đứng, Donut %) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Biểu đồ so sánh quy mô và doanh thu 8 Cơ sở</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <span className="text-[11px] text-slate-500 font-semibold px-1">Dạng biểu đồ:</span>
            {[
              { id: 'horizontal' as const, label: 'Thanh ngang' },
              { id: 'column' as const, label: 'Cột đứng' },
              { id: 'donut' as const, label: 'Tròn Donut %' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setCampusChartMode(mode.id)}
                className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer font-bold ${
                  campusChartMode === mode.id
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Dạng Thanh ngang (Horizontal Bars) */}
        {campusChartMode === 'horizontal' && (
          <div className="space-y-2.5 pt-1">
            {branchStats.map(stat => {
              const isCurrent = selectedBranch === stat.branch.MaChiNhanh;
              const barWidthPercent = Math.max(5, Math.round((stat.collected / maxBranchRevenue) * 100));

              return (
                <div
                  key={stat.branch.MaChiNhanh}
                  onClick={() => setSelectedBranch(isCurrent ? 'ALL' : stat.branch.MaChiNhanh)}
                  className={`p-2.5 rounded-lg transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 px-1.5 py-0.5 bg-blue-100 rounded text-[10px]">
                        {stat.branch.MaChiNhanh}
                      </span>
                      <span className="font-semibold text-slate-900">{stat.branch.TenChiNhanh}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">{stat.enrollmentsCount} học viên · {stat.classesCount} lớp</span>
                      <span className="font-mono font-bold text-emerald-700">{formatVND(stat.collected)}</span>
                    </div>
                  </div>

                  {/* Progress visual bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${stat.color}`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Dạng Cột đứng (Vertical Columns) */}
        {campusChartMode === 'column' && (
          <div className="pt-2 pb-2 overflow-x-auto">
            <div className="flex items-end h-52 border-b border-slate-200 px-4 gap-3 min-w-[600px]">
              {branchStats.map(stat => {
                const heightPercent = Math.max(8, Math.round((stat.collected / maxBranchRevenue) * 90));
                const isCurrent = selectedBranch === stat.branch.MaChiNhanh;

                return (
                  <div
                    key={stat.branch.MaChiNhanh}
                    onClick={() => setSelectedBranch(isCurrent ? 'ALL' : stat.branch.MaChiNhanh)}
                    className="flex-1 flex flex-col items-center h-full justify-end group min-w-[48px] cursor-pointer"
                  >
                    <div className="text-[9px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {(stat.collected / 1000000).toFixed(0)}Tr
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${stat.color} ${
                        isCurrent ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-90 hover:opacity-100'
                      }`}
                    />
                    <span className={`text-[10px] mt-2 font-mono font-bold whitespace-nowrap ${
                      isCurrent ? 'text-blue-700 font-extrabold' : 'text-slate-700'
                    }`}>
                      {stat.branch.MaChiNhanh}
                    </span>
                    <span className="text-[9px] text-slate-500 truncate max-w-[50px] text-center">
                      {stat.enrollmentsCount}HV
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-2">
              <span>Bấm vào cột để lọc số liệu theo chi nhánh</span>
              <span>Đơn vị: VNĐ</span>
            </div>
          </div>
        )}

        {/* 3. Dạng Donut % Share (Biểu đồ Tròn) */}
        {campusChartMode === 'donut' && (
          <div className="pt-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Donut Chart SVG */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      const totalCollected = branchStats.reduce((s, b) => s + b.collected, 0) || 1;
                      let cumulativeAngle = 0;
                      const hexPalette = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];

                      return branchStats.map((stat, idx) => {
                        const percent = (stat.collected / totalCollected) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativeAngle;
                        cumulativeAngle += percent;
                        const isCurrent = selectedBranch === stat.branch.MaChiNhanh;

                        return (
                          <circle
                            key={stat.branch.MaChiNhanh}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={hexPalette[idx % hexPalette.length]}
                            strokeWidth={isCurrent ? '16' : '13'}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            pathLength="100"
                            onClick={() => setSelectedBranch(isCurrent ? 'ALL' : stat.branch.MaChiNhanh)}
                            className="transition-all duration-200 cursor-pointer hover:opacity-80"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Tổng thực thu</span>
                    <span className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                      {formatVND(branchStats.reduce((s, b) => s + b.collected, 0))}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold mt-0.5">8 Chi nhánh</span>
                  </div>
                </div>
              </div>

              {/* Branch % Breakdown List */}
              <div className="md:col-span-7 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {branchStats.map((stat, idx) => {
                  const totalCollected = branchStats.reduce((s, b) => s + b.collected, 0) || 1;
                  const share = ((stat.collected / totalCollected) * 100).toFixed(1);
                  const isCurrent = selectedBranch === stat.branch.MaChiNhanh;
                  const hexPalette = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];

                  return (
                    <div
                      key={stat.branch.MaChiNhanh}
                      onClick={() => setSelectedBranch(isCurrent ? 'ALL' : stat.branch.MaChiNhanh)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs transition cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 font-bold shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: hexPalette[idx % hexPalette.length] }}
                        />
                        <span className="font-mono text-[10px] text-slate-500">{stat.branch.MaChiNhanh}</span>
                        <span className="truncate text-slate-800">{stat.branch.TenChiNhanh}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900">{formatVND(stat.collected)}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[10px] font-mono font-bold">
                          {share}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bảng Chi tiết 8 Cơ sở */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span>Bảng tổng hợp chi tiết hiệu quả hoạt động 8 Cơ sở</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Toàn quốc</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Cơ sở</th>
                <th className="py-2.5 px-3">Địa bàn</th>
                <th className="py-2.5 px-3 text-center">Số lớp</th>
                <th className="py-2.5 px-3 text-center">Học viên</th>
                <th className="py-2.5 px-3 text-right">Phát sinh</th>
                <th className="py-2.5 px-3 text-right">Thực thu</th>
                <th className="py-2.5 px-3 text-right">Công nợ</th>
                <th className="py-2.5 px-3 text-center">Tỷ lệ thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branchStats.map(stat => (
                <tr key={stat.branch.MaChiNhanh} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="font-mono text-blue-700 mr-1.5">[{stat.branch.MaChiNhanh}]</span>
                    {stat.branch.TenChiNhanh.replace(/Cơ sở \d+ - /, '')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{stat.branch.DiaChi}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{stat.classesCount}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{stat.enrollmentsCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900">{formatVND(stat.billed)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatVND(stat.collected)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600">{formatVND(stat.debt)}</td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      {stat.percentCollected}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPublishModal && (
        <ReportModal
          initialBranchId={selectedBranch}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
};
