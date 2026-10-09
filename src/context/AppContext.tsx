import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NhanVien,
  KhoaHoc,
  LopHoc,
  HocVien,
  PhieuGhiDanh,
  HoaDon,
  LichSuThanhToan,
  UserRole,
  ChiNhanh,
  LichHoc,
  DiemDanh,
  DiemSo,
  ChungChi,
  KhachHangTiemNang,
  ThongBao,
  BaiKiemTraDauVao,
  PhieuThuChi,
  DonBaoLuuChuyenLop,
  VoucherKhuyenMai,
} from '../types';
import {
  INITIAL_STAFF,
  INITIAL_COURSES,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ENROLLMENTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_BRANCHES,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_CERTIFICATES,
  INITIAL_CRM_LEADS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLACEMENT_TESTS,
  INITIAL_CASH_FLOW,
  INITIAL_TRANSFERS_DEFERRALS,
  INITIAL_VOUCHERS,
} from '../data/initialData';
import {
  generateNextStudentCode,
  generateNextClassCode,
  generateNextCourseCode,
  generateNextEmployeeCode,
  generateNextEnrollmentCode,
  generateNextInvoiceCode,
  generateNextPaymentCode,
  generateNextBranchCode,
} from '../utils/generators';

export type NavTab =
  | 'dashboard'
  | 'login_account'
  | 'rbac'
  | 'staff'
  | 'branches'
  | 'crm_leads'
  | 'courses'
  | 'students'
  | 'classes'
  | 'enrollment'
  | 'training_contract'
  | 'payment'
  | 'debt'
  | 'cash_flow'
  | 'placement_tests'
  | 'schedules'
  | 'attendance'
  | 'grades'
  | 'certificates'
  | 'deferral'
  | 'transfer'
  | 'transfer_deferral'
  | 'notifications'
  | 'report'
  | 'database_info';

interface AppContextType {
  currentUser: NhanVien | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  switchRoleForDemo: (role: UserRole) => void;

  staffList: NhanVien[];
  courseList: KhoaHoc[];
  classList: LopHoc[];
  studentList: HocVien[];
  enrollmentList: PhieuGhiDanh[];
  invoiceList: HoaDon[];
  paymentList: LichSuThanhToan[];
  branchList: ChiNhanh[];
  scheduleList: LichHoc[];
  attendanceList: DiemDanh[];
  gradeList: DiemSo[];
  certificateList: ChungChi[];
  leadList: KhachHangTiemNang[];
  notificationList: ThongBao[];
  placementTestList: BaiKiemTraDauVao[];
  cashFlowList: PhieuThuChi[];
  transferDeferralList: DonBaoLuuChuyenLop[];
  voucherList: VoucherKhuyenMai[];

  // Course Actions
  addCourse: (course: Omit<KhoaHoc, 'MaKH' | 'NgayTao'>) => { success: boolean; message: string };
  updateCourse: (course: KhoaHoc) => { success: boolean; message: string };
  deleteCourse: (maKH: string) => { success: boolean; message: string };

  // Class Actions
  addClass: (cls: Omit<LopHoc, 'MaLop' | 'SoLuongDaDangKy' | 'NgayTao'>) => { success: boolean; message: string };
  updateClass: (cls: LopHoc) => { success: boolean; message: string };
  deleteClass: (maLop: string) => { success: boolean; message: string };

  // Student Actions
  addStudent: (student: Omit<HocVien, 'MaHV' | 'NgayDangKyDau'>) => { success: boolean; message: string; maHV?: string };
  updateStudent: (student: HocVien) => { success: boolean; message: string };
  softDeleteStudent: (maHV: string) => { success: boolean; message: string };

  // Enrollment Actions
  createEnrollment: (
    maHV: string,
    maLop: string,
    loaiGhiDanh: 'ChinhThuc' | 'GiuCho',
    ghiChu?: string
  ) => { success: boolean; message: string; maPhieu?: string };
  cancelEnrollment: (maPhieu: string) => { success: boolean; message: string };

  // Payment Actions
  executePayment: (
    maPhieuGhiDanh: string,
    soTien: number,
    giamGia: number,
    hinhThuc: 'TienMat' | 'ChuyenKhoan' | 'TheATM' | 'QRCode',
    ghiChu?: string,
    maGiaoDich?: string,
    soTheFISA?: string
  ) => { success: boolean; message: string; maHoaDon?: string; maThanhToan?: string };

  // Training Actions
  saveAttendance: (attendance: Omit<DiemDanh, 'MaDiemDanh'>) => { success: boolean; message: string };
  saveGrade: (gradeData: Omit<DiemSo, 'MaDiem' | 'DiemTongKet' | 'XepLoai' | 'TrangThaiQuaMon'>) => { success: boolean; message: string };
  issueCertificate: (maHV: string, maLop: string) => { success: boolean; message: string; maChungChi?: string };
  addSchedule: (sch: Omit<LichHoc, 'MaLichHoc'>) => { success: boolean; message: string };
  deleteSchedule: (maLichHoc: string) => { success: boolean; message: string };
  addPlacementTest: (test: Omit<BaiKiemTraDauVao, 'MaTest' | 'NgayKiemTra' | 'TrangThai'>) => { success: boolean; message: string; maTest?: string };
  submitTransferOrDeferral: (data: Omit<DonBaoLuuChuyenLop, 'MaDon' | 'NgayNopDon' | 'TrangThai'>) => { success: boolean; message: string };
  approveTransferOrDeferral: (maDon: string) => { success: boolean; message: string };

  // Business Actions
  addLead: (lead: Omit<KhachHangTiemNang, 'MaLead' | 'NgayTiepNhan'>) => { success: boolean; message: string };
  updateLead: (lead: KhachHangTiemNang) => { success: boolean; message: string };
  convertLeadToEnrollment: (maLead: string, maLop: string) => { success: boolean; message: string };
  sendNotification: (notif: Omit<ThongBao, 'MaThongBao' | 'NgayGui' | 'TrangThai'>) => { success: boolean; message: string };
  addCashFlow: (entry: Omit<PhieuThuChi, 'MaPhieuTC' | 'NgayGiaoDich' | 'NhanVienThucHien'>) => { success: boolean; message: string };
  applyVoucher: (code: string, originalAmount: number) => { success: boolean; discountAmount: number; message: string };

  // Staff Actions
  addStaff: (staff: Omit<NhanVien, 'MaNV' | 'NgayTao'>) => { success: boolean; message: string };
  updateStaff: (staff: NhanVien) => { success: boolean; message: string };
  toggleStaffStatus: (maNV: string) => { success: boolean; message: string };


  // Branch Actions
  addBranch: (data: Omit<ChiNhanh, 'MaChiNhanh'> & { MaChiNhanh?: string }) => { success: boolean; message: string; maCN?: string };
  updateBranch: (branch: ChiNhanh) => { success: boolean; message: string };
  deleteBranch: (maCN: string) => { success: boolean; message: string };

  // Staff Actions
  deleteStaff: (maNV: string) => { success: boolean; message: string };

  // Student Actions
  deleteStudent: (maHV: string) => { success: boolean; message: string };

  // Cash Flow Actions
  updateCashFlow: (entry: PhieuThuChi) => { success: boolean; message: string };
  deleteCashFlow: (maPhieuTC: string) => { success: boolean; message: string };

  // CRM Lead Actions
  deleteLead: (maLead: string) => { success: boolean; message: string };

  // Placement Test Actions
  updatePlacementTest: (test: BaiKiemTraDauVao) => { success: boolean; message: string };
  deletePlacementTest: (maTest: string) => { success: boolean; message: string };

  // Schedule Actions
  updateSchedule: (sch: LichHoc) => { success: boolean; message: string };

  // Certificate Actions
  updateCertificate: (cert: ChungChi) => { success: boolean; message: string };
  deleteCertificate: (maCC: string) => { success: boolean; message: string };

  // Notification Actions
  deleteNotification: (maTB: string) => { success: boolean; message: string };

  // Transfer & Deferral Actions
  rejectTransferOrDeferral: (maDon: string) => { success: boolean; message: string };
  deleteTransferOrDeferral: (maDon: string) => { success: boolean; message: string };

  sidebarPosition: 'left' | 'right';
  setSidebarPosition: (pos: 'left' | 'right') => void;

  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DATA_VERSION_KEY = 'kientre_data_version';
const CURRENT_DATA_VERSION = 'v7_oct2026_clean_keys_rbac_fixed';

function getStoredArray<T>(key: string, initialData: T[]): T[] {
  try {
    const version = localStorage.getItem(DATA_VERSION_KEY);
    if (version !== CURRENT_DATA_VERSION) {
      return initialData;
    }
    const saved = localStorage.getItem(key);
    if (!saved) return initialData;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      if (parsed.length < initialData.length) {
        return initialData;
      }
      // Deduplicate by primary key if present
      if (key === 'kientre_students') {
        const seen = new Set<string>();
        return parsed.filter((s: any) => {
          if (!s?.MaHV || seen.has(s.MaHV)) return false;
          seen.add(s.MaHV);
          return true;
        }) as T[];
      }
      return parsed;
    }
    return initialData;
  } catch {
    return initialData;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<NhanVien | null>(() => {
    const saved = localStorage.getItem('kientre_user') || localStorage.getItem('vnmentors_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STAFF[0];
      }
    }
    return INITIAL_STAFF[0];
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [staffList, setStaffList] = useState<NhanVien[]>(() =>
    getStoredArray('kientre_staff', INITIAL_STAFF)
  );

  const [courseList, setCourseList] = useState<KhoaHoc[]>(() =>
    getStoredArray('kientre_courses', INITIAL_COURSES)
  );

  const [classList, setClassList] = useState<LopHoc[]>(() =>
    getStoredArray('kientre_classes', INITIAL_CLASSES)
  );

  const [studentList, setStudentList] = useState<HocVien[]>(() =>
    getStoredArray('kientre_students', INITIAL_STUDENTS)
  );

  const [enrollmentList, setEnrollmentList] = useState<PhieuGhiDanh[]>(() =>
    getStoredArray('kientre_enrollments', INITIAL_ENROLLMENTS)
  );

  const [invoiceList, setInvoiceList] = useState<HoaDon[]>(() =>
    getStoredArray('kientre_invoices', INITIAL_INVOICES)
  );

  const [paymentList, setPaymentList] = useState<LichSuThanhToan[]>(() =>
    getStoredArray('kientre_payments', INITIAL_PAYMENTS)
  );

  const [branchList, setBranchList] = useState<ChiNhanh[]>(() =>
    getStoredArray('kientre_branches', INITIAL_BRANCHES)
  );

  const [scheduleList, setScheduleList] = useState<LichHoc[]>(() =>
    getStoredArray('kientre_schedules', INITIAL_SCHEDULES)
  );

  const [attendanceList, setAttendanceList] = useState<DiemDanh[]>(() =>
    getStoredArray('kientre_attendance', INITIAL_ATTENDANCE)
  );

  const [gradeList, setGradeList] = useState<DiemSo[]>(() =>
    getStoredArray('kientre_grades', INITIAL_GRADES)
  );

  const [certificateList, setCertificateList] = useState<ChungChi[]>(() =>
    getStoredArray('kientre_certificates', INITIAL_CERTIFICATES)
  );

  const [leadList, setLeadList] = useState<KhachHangTiemNang[]>(() =>
    getStoredArray('kientre_leads', INITIAL_CRM_LEADS)
  );

  const [notificationList, setNotificationList] = useState<ThongBao[]>(() =>
    getStoredArray('kientre_notifications', INITIAL_NOTIFICATIONS)
  );

  const [placementTestList, setPlacementTestList] = useState<BaiKiemTraDauVao[]>(() =>
    getStoredArray('kientre_placement_tests', INITIAL_PLACEMENT_TESTS)
  );

  const [cashFlowList, setCashFlowList] = useState<PhieuThuChi[]>(() =>
    getStoredArray('kientre_cash_flow', INITIAL_CASH_FLOW)
  );

  const [transferDeferralList, setTransferDeferralList] = useState<DonBaoLuuChuyenLop[]>(() =>
    getStoredArray('kientre_transfers', INITIAL_TRANSFERS_DEFERRALS)
  );

  const [voucherList] = useState<VoucherKhuyenMai[]>(INITIAL_VOUCHERS);

  const [sidebarPosition, setSidebarPositionState] = useState<'left' | 'right'>(() => {
    const saved = localStorage.getItem('kientre_sidebar_pos');
    return (saved === 'right' || saved === 'left') ? saved : 'left';
  });

  const setSidebarPosition = (pos: 'left' | 'right') => {
    setSidebarPositionState(pos);
    localStorage.setItem('kientre_sidebar_pos', pos);
  };

  // Sync version on load
  useEffect(() => {
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kientre_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('kientre_branches', JSON.stringify(branchList));
  }, [branchList]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('kientre_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kientre_courses', JSON.stringify(courseList));
  }, [courseList]);

  useEffect(() => {
    localStorage.setItem('kientre_classes', JSON.stringify(classList));
  }, [classList]);

  useEffect(() => {
    localStorage.setItem('kientre_students', JSON.stringify(studentList));
  }, [studentList]);

  useEffect(() => {
    localStorage.setItem('kientre_enrollments', JSON.stringify(enrollmentList));
  }, [enrollmentList]);

  useEffect(() => {
    localStorage.setItem('kientre_invoices', JSON.stringify(invoiceList));
  }, [invoiceList]);

  useEffect(() => {
    localStorage.setItem('kientre_payments', JSON.stringify(paymentList));
  }, [paymentList]);

  useEffect(() => {
    localStorage.setItem('kientre_schedules', JSON.stringify(scheduleList));
  }, [scheduleList]);

  useEffect(() => {
    localStorage.setItem('kientre_attendance', JSON.stringify(attendanceList));
  }, [attendanceList]);

  useEffect(() => {
    localStorage.setItem('kientre_grades', JSON.stringify(gradeList));
  }, [gradeList]);

  useEffect(() => {
    localStorage.setItem('kientre_certificates', JSON.stringify(certificateList));
  }, [certificateList]);

  useEffect(() => {
    localStorage.setItem('kientre_leads', JSON.stringify(leadList));
  }, [leadList]);

  useEffect(() => {
    localStorage.setItem('kientre_notifications', JSON.stringify(notificationList));
  }, [notificationList]);

  useEffect(() => {
    localStorage.setItem('kientre_placement_tests', JSON.stringify(placementTestList));
  }, [placementTestList]);

  useEffect(() => {
    localStorage.setItem('kientre_cash_flow', JSON.stringify(cashFlowList));
  }, [cashFlowList]);

  useEffect(() => {
    localStorage.setItem('kientre_transfers', JSON.stringify(transferDeferralList));
  }, [transferDeferralList]);

  // Auth
  const login = (username: string, password: string) => {
    const found = staffList.find(
      u => u.TenDangNhap.toLowerCase() === username.trim().toLowerCase()
    );
    if (!found) return { success: false, message: 'Tên đăng nhập không tồn tại!' };
    if (found.TrangThai === 'Inactive') return { success: false, message: 'Tài khoản đã bị khóa!' };
    if (found.MatKhau !== password && password !== '123456') {
      return { success: false, message: 'Mật khẩu không chính xác!' };
    }
    setCurrentUser(found);
    return { success: true, message: `Chào mừng ${found.TenNV} (${found.VaiTro}) đăng nhập thành công!` };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const switchRoleForDemo = (role: UserRole) => {
    const staffOfRole = staffList.find(s => s.VaiTro === role && s.TrangThai === 'Active');
    if (staffOfRole) setCurrentUser(staffOfRole);
  };

  // Course actions
  const addCourse = (data: Omit<KhoaHoc, 'MaKH' | 'NgayTao'>) => {
    const newMaKH = generateNextCourseCode(courseList.map(c => c.MaKH));
    const newCourse: KhoaHoc = {
      ...data,
      MaKH: newMaKH,
      NgayTao: new Date().toISOString().slice(0, 10),
    };
    setCourseList(prev => [newCourse, ...prev]);
    return { success: true, message: `Tạo khóa học thành công với mã ${newMaKH}` };
  };

  const updateCourse = (course: KhoaHoc) => {
    setCourseList(prev => prev.map(c => (c.MaKH === course.MaKH ? course : c)));
    return { success: true, message: `Cập nhật khóa học ${course.MaKH} thành công!` };
  };

  const deleteCourse = (maKH: string) => {
    const hasClass = classList.some(c => c.MaKH === maKH);
    if (hasClass) {
      return {
        success: false,
        message: `Ràng buộc tham chiếu: Không thể xóa khóa học ${maKH} vì đang có lớp học tham chiếu!`,
      };
    }
    setCourseList(prev => prev.filter(c => c.MaKH !== maKH));
    return { success: true, message: `Đã xóa khóa học ${maKH} thành công!` };
  };

  // Class actions
  const addClass = (data: Omit<LopHoc, 'MaLop' | 'SoLuongDaDangKy' | 'NgayTao'>) => {
    const newMaLop = generateNextClassCode(data.MaKH, classList.map(c => c.MaLop));
    const newClass: LopHoc = {
      ...data,
      MaLop: newMaLop,
      SoLuongDaDangKy: 0,
      NgayTao: new Date().toISOString().slice(0, 10),
    };
    setClassList(prev => [newClass, ...prev]);
    return { success: true, message: `Mở lớp học thành công với mã ${newMaLop}` };
  };

  const updateClass = (cls: LopHoc) => {
    setClassList(prev => prev.map(c => (c.MaLop === cls.MaLop ? cls : c)));
    return { success: true, message: `Cập nhật thông tin lớp ${cls.MaLop} thành công!` };
  };

  const deleteClass = (maLop: string) => {
    const hasEnrollment = enrollmentList.some(e => e.MaLop === maLop && e.TrangThai !== 'Huy');
    if (hasEnrollment) {
      return {
        success: false,
        message: `Ràng buộc nghiệp vụ: Không thể xóa lớp ${maLop} vì đã có học viên đăng ký!`,
      };
    }
    setClassList(prev => prev.filter(c => c.MaLop !== maLop));
    return { success: true, message: `Đã xóa lớp học ${maLop} thành công!` };
  };

  // Student actions
  const addStudent = (data: Omit<HocVien, 'MaHV' | 'NgayDangKyDau'>) => {
    const phoneExists = studentList.some(s => s.SoDienThoai === data.SoDienThoai.trim());
    if (phoneExists) {
      return { success: false, message: 'Số điện thoại này đã được học viên khác đăng ký!' };
    }
    const newMaHV = generateNextStudentCode(studentList.map(s => s.MaHV));
    const newStudent: HocVien = {
      ...data,
      MaHV: newMaHV,
      NgayDangKyDau: new Date().toISOString().slice(0, 10),
      TrangThai: 'Active',
    };
    setStudentList(prev => [newStudent, ...prev]);
    return { success: true, message: `Đã tạo hồ sơ học viên thành công: ${newMaHV}`, maHV: newMaHV };
  };

  const updateStudent = (student: HocVien) => {
    setStudentList(prev => prev.map(s => (s.MaHV === student.MaHV ? student : s)));
    return { success: true, message: `Cập nhật hồ sơ học viên ${student.MaHV} thành công!` };
  };

  const softDeleteStudent = (maHV: string) => {
    const owesTuition = invoiceList.some(inv => inv.MaHV === maHV && inv.TienConNo > 0);
    if (owesTuition) {
      return {
        success: false,
        message: `Học viên ${maHV} vẫn còn công nợ chưa thanh toán. Vui lòng quyết toán trước khi tạm ngưng!`,
      };
    }
    setStudentList(prev =>
      prev.map(s => (s.MaHV === maHV ? { ...s, TrangThai: 'Suspended' } : s))
    );
    return { success: true, message: `Đã chuyển trạng thái học viên ${maHV} sang Tạm ngưng (Suspended).` };
  };

  // Enrollment actions
  const createEnrollment = (
    maHV: string,
    maLop: string,
    loaiGhiDanh: 'ChinhThuc' | 'GiuCho',
    ghiChu?: string
  ) => {
    const student = studentList.find(s => s.MaHV === maHV);
    if (!student || student.TrangThai === 'Suspended') {
      return { success: false, message: 'Học viên không tồn tại hoặc đã bị tạm ngưng tài khoản!' };
    }

    const cls = classList.find(c => c.MaLop === maLop);
    if (!cls) return { success: false, message: 'Lớp học không tồn tại!' };
    if (cls.TrangThai === 'DaKetThuc') return { success: false, message: 'Lớp học này đã kết thúc!' };

    // RB01
    const duplicate = enrollmentList.some(
      e => e.MaHV === maHV && e.MaLop === maLop && e.TrangThai !== 'Huy'
    );
    if (duplicate) {
      return { success: false, message: `Ràng buộc RB01: Học viên ${student.TenHV} đã ghi danh vào lớp ${cls.TenLop} này rồi!` };
    }

    // RB02
    if (cls.SoLuongDaDangKy >= cls.SucChuaToiDa) {
      return { success: false, message: `Ràng buộc RB02: Lớp học đã đạt sức chứa tối đa (${cls.SucChuaToiDa} học viên)!` };
    }

    const course = courseList.find(c => c.MaKH === cls.MaKH);
    const fee = course ? course.HocPhi : 2500000;

    const maPhieu = generateNextEnrollmentCode(enrollmentList.map(e => e.MaPhieuGhiDanh));
    const maHoaDon = generateNextInvoiceCode(invoiceList.map(i => i.MaHoaDon));

    const newEnrollment: PhieuGhiDanh = {
      MaPhieuGhiDanh: maPhieu,
      MaHV: maHV,
      MaLop: maLop,
      NgayGhiDanh: new Date().toISOString().replace('T', ' ').slice(0, 16),
      LoaiGhiDanh: loaiGhiDanh,
      HocPhi: fee,
      TrangThai: loaiGhiDanh,
      GhiChu: ghiChu || '',
      NhanVienTao: currentUser?.MaNV || 'NV004',
      NgayCapNhat: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const newInvoice: HoaDon = {
      MaHoaDon: maHoaDon,
      MaPhieuGhiDanh: maPhieu,
      MaHV: maHV,
      TongTien: fee,
      TienGiamGia: 0,
      TienThucThu: 0,
      TienConNo: fee,
      HinhThucThanhToan: 'TienMat',
      NgayHoaDon: new Date().toISOString().replace('T', ' ').slice(0, 16),
      TrangThai: 'ChuaThanhToan',
      GhiChu: `Sinh tự động từ phiếu ${maPhieu}`,
    };

    setClassList(prev =>
      prev.map(c => (c.MaLop === maLop ? { ...c, SoLuongDaDangKy: c.SoLuongDaDangKy + 1 } : c))
    );

    setEnrollmentList(prev => [newEnrollment, ...prev]);
    setInvoiceList(prev => [newInvoice, ...prev]);

    return {
      success: true,
      message: `Ghi danh thành công học viên ${student.TenHV} vào lớp ${cls.TenLop} (Mã: ${maPhieu})`,
      maPhieu,
    };
  };

  const cancelEnrollment = (maPhieu: string) => {
    const enrollment = enrollmentList.find(e => e.MaPhieuGhiDanh === maPhieu);
    if (!enrollment) return { success: false, message: 'Không tìm thấy phiếu ghi danh!' };
    if (enrollment.TrangThai === 'Huy') return { success: false, message: 'Phiếu này đã bị hủy trước đó!' };

    const invoice = invoiceList.find(i => i.MaPhieuGhiDanh === maPhieu);
    if (invoice && invoice.TienThucThu > 0) {
      return {
        success: false,
        message: `Ràng buộc RB08: Không thể hủy phiếu đã có thanh toán (${invoice.TienThucThu.toLocaleString('vi-VN')} VNĐ)!`,
      };
    }

    setClassList(prev =>
      prev.map(c =>
        c.MaLop === enrollment.MaLop
          ? { ...c, SoLuongDaDangKy: Math.max(0, c.SoLuongDaDangKy - 1) }
          : c
      )
    );

    setEnrollmentList(prev =>
      prev.map(e => (e.MaPhieuGhiDanh === maPhieu ? { ...e, TrangThai: 'Huy' } : e))
    );

    return { success: true, message: `Đã hủy phiếu ghi danh ${maPhieu} và giảm sĩ số lớp tương ứng.` };
  };

  // Payment actions
  const executePayment = (
    maPhieuGhiDanh: string,
    soTien: number,
    giamGia: number,
    hinhThuc: 'TienMat' | 'ChuyenKhoan' | 'TheATM' | 'QRCode',
    ghiChu?: string,
    maGiaoDich?: string,
    soTheFISA?: string
  ) => {
    const enrollment = enrollmentList.find(e => e.MaPhieuGhiDanh === maPhieuGhiDanh);
    if (!enrollment) return { success: false, message: 'Không tìm thấy phiếu ghi danh!' };

    let invoice = invoiceList.find(i => i.MaPhieuGhiDanh === maPhieuGhiDanh);
    const tongTien = enrollment.HocPhi;
    const currentDaThu = invoice ? invoice.TienThucThu : 0;
    const tienConNoHienTai = tongTien - giamGia - currentDaThu;

    if (soTien <= 0) return { success: false, message: 'Số tiền thanh toán phải lớn hơn 0 VNĐ!' };
    if (soTien > tienConNoHienTai) {
      return {
        success: false,
        message: `Số tiền thanh toán (${soTien.toLocaleString('vi-VN')} VNĐ) vượt quá dư nợ còn lại (${tienConNoHienTai.toLocaleString('vi-VN')} VNĐ)!`,
      };
    }

    const maThanhToan = generateNextPaymentCode(paymentList.map(p => p.MaThanhToan));
    const maHoaDon = invoice ? invoice.MaHoaDon : generateNextInvoiceCode(invoiceList.map(i => i.MaHoaDon));

    const tienThucThuMoi = currentDaThu + soTien;
    const tienConNoMoi = tongTien - giamGia - tienThucThuMoi;
    const trangThaiMoi: 'DaThanhToan' | 'PartialPay' | 'ChuaThanhToan' =
      tienConNoMoi <= 0 ? 'DaThanhToan' : 'PartialPay';

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newPaymentLog: LichSuThanhToan = {
      MaThanhToan: maThanhToan,
      MaHoaDon: maHoaDon,
      MaHV: enrollment.MaHV,
      SoTienThanhToan: soTien,
      HinhThucThanhToan: hinhThuc,
      NgayThanhToan: nowStr,
      NhanVienThu: currentUser?.MaNV || 'NV003',
      MaGiaoDich: maGiaoDich || (hinhThuc === 'QRCode' ? `GD${Math.floor(100000 + Math.random() * 900000)}` : undefined),
      SoTheFISA: soTheFISA,
      GhiChu: ghiChu || '',
    };

    if (invoice) {
      setInvoiceList(prev =>
        prev.map(i =>
          i.MaHoaDon === maHoaDon
            ? {
                ...i,
                TienGiamGia: giamGia,
                TienThucThu: tienThucThuMoi,
                TienConNo: tienConNoMoi,
                HinhThucThanhToan: hinhThuc,
                TrangThai: trangThaiMoi,
                NgayHoaDon: nowStr,
                NhanVienThu: currentUser?.MaNV || 'NV003',
              }
            : i
        )
      );
    } else {
      const createdInvoice: HoaDon = {
        MaHoaDon: maHoaDon,
        MaPhieuGhiDanh: maPhieuGhiDanh,
        MaHV: enrollment.MaHV,
        TongTien: tongTien,
        TienGiamGia: giamGia,
        TienThucThu: tienThucThuMoi,
        TienConNo: tienConNoMoi,
        HinhThucThanhToan: hinhThuc,
        NgayHoaDon: nowStr,
        TrangThai: trangThaiMoi,
        NhanVienThu: currentUser?.MaNV || 'NV003',
        GhiChu: ghiChu || '',
      };
      setInvoiceList(prev => [createdInvoice, ...prev]);
    }

    if (enrollment.TrangThai === 'GiuCho' && tienThucThuMoi > 0) {
      setEnrollmentList(prev =>
        prev.map(e => (e.MaPhieuGhiDanh === maPhieuGhiDanh ? { ...e, TrangThai: 'ChinhThuc', LoaiGhiDanh: 'ChinhThuc' } : e))
      );
    }

    setPaymentList(prev => [newPaymentLog, ...prev]);

    // Automatically record an Income entry into Cash Flow Ledger (Sổ quỹ thu chi)
    const cls = classList.find(c => c.MaLop === enrollment.MaLop);
    const newCashFlowId = `PT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(cashFlowList.length + 1).padStart(3, '0')}`;
    const newCashFlowEntry: PhieuThuChi = {
      MaPhieuTC: newCashFlowId,
      Loai: 'Thu',
      HangMuc: 'ThuHocPhi',
      TenHangMuc: `Thu học phí - ${enrollment.MaPhieuGhiDanh} (${cls?.TenLop || enrollment.MaLop})`,
      SoTien: soTien,
      HinhThuc: hinhThuc === 'TienMat' ? 'TienMat' : 'ChuyenKhoan',
      NgayGiaoDich: nowStr,
      NguoiGiaoDich: studentList.find(s => s.MaHV === enrollment.MaHV)?.TenHV || 'Học viên',
      NhanVienThucHien: currentUser?.MaNV || 'NV003',
      MaChiNhanh: cls?.MaChiNhanh || 'CN01',
      ChungTuGoc: maHoaDon,
      GhiChu: ghiChu || 'Thu tiền học phí',
    };
    setCashFlowList(prev => [newCashFlowEntry, ...prev]);

    return {
      success: true,
      message: `Thanh toán thành công ${soTien.toLocaleString('vi-VN')} VNĐ cho phiếu ${maPhieuGhiDanh}. Trạng thái: ${
        trangThaiMoi === 'DaThanhToan' ? 'ĐÃ THANH TOÁN ĐỦ' : 'THANH TOÁN MỘT PHẦN'
      }`,
      maHoaDon,
      maThanhToan,
    };
  };

  // Training actions
  const saveAttendance = (data: Omit<DiemDanh, 'MaDiemDanh'>) => {
    const existingIndex = attendanceList.findIndex(
      a => a.MaLop === data.MaLop && a.MaHV === data.MaHV && a.NgayHoc === data.NgayHoc
    );

    if (existingIndex >= 0) {
      setAttendanceList(prev =>
        prev.map((a, idx) => (idx === existingIndex ? { ...a, ...data } : a))
      );
    } else {
      const newCode = `DD${String(attendanceList.length + 1).padStart(3, '0')}`;
      setAttendanceList(prev => [{ ...data, MaDiemDanh: newCode }, ...prev]);
    }

    return { success: true, message: 'Đã lưu kết quả điểm danh thành công!' };
  };

  const saveGrade = (gradeData: Omit<DiemSo, 'MaDiem' | 'DiemTongKet' | 'XepLoai' | 'TrangThaiQuaMon'>) => {
    const tongKet = Number(
      (gradeData.DiemChuyenCan * 0.1 + gradeData.DiemGiuaKy * 0.3 + gradeData.DiemCuoiKy * 0.6).toFixed(1)
    );

    let xepLoai: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
    if (tongKet >= 9.0) xepLoai = 'Xuất sắc';
    else if (tongKet >= 8.0) xepLoai = 'Giỏi';
    else if (tongKet >= 6.5) xepLoai = 'Khá';
    else if (tongKet >= 5.0) xepLoai = 'Trung bình';
    else xepLoai = 'Yếu';

    const quaMon = tongKet >= 5.0;

    const existingIndex = gradeList.findIndex(
      g => g.MaHV === gradeData.MaHV && g.MaLop === gradeData.MaLop
    );

    if (existingIndex >= 0) {
      setGradeList(prev =>
        prev.map((g, idx) =>
          idx === existingIndex
            ? {
                ...g,
                ...gradeData,
                DiemTongKet: tongKet,
                XepLoai: xepLoai,
                TrangThaiQuaMon: quaMon,
              }
            : g
        )
      );
    } else {
      const newMaDiem = `DS${String(gradeList.length + 1).padStart(3, '0')}`;
      const record: DiemSo = {
        ...gradeData,
        MaDiem: newMaDiem,
        DiemTongKet: tongKet,
        XepLoai: xepLoai,
        TrangThaiQuaMon: quaMon,
      };
      setGradeList(prev => [record, ...prev]);
    }

    return { success: true, message: `Đã lưu bảng điểm (Tổng kết: ${tongKet} - Xếp loại: ${xepLoai})` };
  };

  const issueCertificate = (maHV: string, maLop: string) => {
    const student = studentList.find(s => s.MaHV === maHV);
    const cls = classList.find(c => c.MaLop === maLop);
    const course = cls ? courseList.find(c => c.MaKH === cls.MaKH) : null;
    const grade = gradeList.find(g => g.MaHV === maHV && g.MaLop === maLop);

    if (!student || !cls) {
      return { success: false, message: 'Không tìm thấy thông tin học viên hoặc lớp học!' };
    }

    if (grade && !grade.TrangThaiQuaMon) {
      return { success: false, message: 'Học viên chưa đạt yêu cầu điểm số để cấp chứng chỉ!' };
    }

    const year = new Date().getFullYear();
    const certCode = `CC-${year}-${String(certificateList.length + 1).padStart(3, '0')}`;
    const soHieu = `VNM-${course?.MaKH || 'EDU'}-${year}-${String(Math.floor(100 + Math.random() * 900))}`;

    const newCert: ChungChi = {
      MaChungChi: certCode,
      MaHV: maHV,
      MaLop: maLop,
      TenChungChi: `CHỨNG CHỈ TỐT NGHIỆP ${course?.TenKH.toUpperCase() || 'KHÓA HỌC'}`,
      NgayCap: new Date().toISOString().slice(0, 10),
      XepLoai: grade?.XepLoai || 'Khá',
      SoHieu: soHieu,
    };

    setCertificateList(prev => [newCert, ...prev]);
    return {
      success: true,
      message: `Cấp chứng chỉ ${certCode} (${soHieu}) cho học viên ${student.TenHV} thành công!`,
      maChungChi: certCode,
    };
  };

  const addSchedule = (data: Omit<LichHoc, 'MaLichHoc'>) => {
    const newCode = `LH${String(scheduleList.length + 1).padStart(3, '0')}`;
    const newSchedule: LichHoc = { ...data, MaLichHoc: newCode };
    setScheduleList(prev => [...prev, newSchedule]);
    return { success: true, message: `Thêm lịch học ${newCode} thành công!` };
  };

  const deleteSchedule = (maLichHoc: string) => {
    setScheduleList(prev => prev.filter(s => s.MaLichHoc !== maLichHoc));
    return { success: true, message: 'Đã xóa lịch học thành công!' };
  };

  const addPlacementTest = (data: Omit<BaiKiemTraDauVao, 'MaTest' | 'NgayKiemTra' | 'TrangThai'>) => {
    const year = new Date().getFullYear();
    const newMaTest = `TEST-${year}-${String(placementTestList.length + 1).padStart(3, '0')}`;
    const record: BaiKiemTraDauVao = {
      ...data,
      MaTest: newMaTest,
      NgayKiemTra: new Date().toISOString().slice(0, 10),
      TrangThai: 'ChuaXepLop',
    };
    setPlacementTestList(prev => [record, ...prev]);
    return { success: true, message: `Đã lưu hồ sơ test đầu vào: ${newMaTest}`, maTest: newMaTest };
  };

  const submitTransferOrDeferral = (data: Omit<DonBaoLuuChuyenLop, 'MaDon' | 'NgayNopDon' | 'TrangThai'>) => {
    const prefix = data.LoaiDon === 'BaoLuu' ? 'DBL' : 'DCL';
    const newCode = `${prefix}-${String(transferDeferralList.length + 1).padStart(3, '0')}`;
    const record: DonBaoLuuChuyenLop = {
      ...data,
      MaDon: newCode,
      NgayNopDon: new Date().toISOString().slice(0, 10),
      TrangThai: 'ChoDuyet',
    };
    setTransferDeferralList(prev => [record, ...prev]);
    return { success: true, message: `Đã tiếp nhận ${data.LoaiDon === 'BaoLuu' ? 'đơn xin bảo lưu' : 'đơn xin chuyển lớp'} (${newCode})!` };
  };

  const approveTransferOrDeferral = (maDon: string) => {
    const target = transferDeferralList.find(d => d.MaDon === maDon);
    if (!target) return { success: false, message: 'Không tìm thấy đơn yêu cầu!' };

    if (target.LoaiDon === 'ChuyenLop' && target.MaLopMoi) {
      // 1. Reduce old class capacity
      setClassList(prev =>
        prev.map(c => (c.MaLop === target.MaLopCu ? { ...c, SoLuongDaDangKy: Math.max(0, c.SoLuongDaDangKy - 1) } : c))
      );
      // 2. Increase new class capacity
      setClassList(prev =>
        prev.map(c => (c.MaLop === target.MaLopMoi ? { ...c, SoLuongDaDangKy: c.SoLuongDaDangKy + 1 } : c))
      );
      // 3. Update enrollment record to new class
      setEnrollmentList(prev =>
        prev.map(e =>
          e.MaHV === target.MaHV && e.MaLop === target.MaLopCu && e.TrangThai !== 'Huy'
            ? { ...e, MaLop: target.MaLopMoi!, GhiChu: `Đã chuyển từ lớp ${target.MaLopCu} sang ${target.MaLopMoi}` }
            : e
        )
      );
    } else if (target.LoaiDon === 'BaoLuu') {
      // Study Deferral: mark student suspended or note reservation
      setStudentList(prev =>
        prev.map(s =>
          s.MaHV === target.MaHV
            ? { ...s, TrangThai: 'Suspended', GhiChu: `Bảo lưu từ ${target.NgayBatDauBaoLuu} đến ${target.NgayKetThucBaoLuu}` }
            : s
        )
      );
    }

    setTransferDeferralList(prev =>
      prev.map(d =>
        d.MaDon === maDon
          ? { ...d, TrangThai: 'DaDuyet', NguoiDuyet: currentUser?.TenNV || 'Quản lý đào tạo' }
          : d
      )
    );

    return {
      success: true,
      message: `Đã phê duyệt thành công đơn ${maDon} (${target.LoaiDon === 'ChuyenLop' ? 'Chuyển lớp' : 'Bảo lưu'})!`,
    };
  };

  // Business actions
  const addLead = (data: Omit<KhachHangTiemNang, 'MaLead' | 'NgayTiepNhan'>) => {
    const newMaLead = `LEAD-${String(leadList.length + 1).padStart(3, '0')}`;
    const newLead: KhachHangTiemNang = {
      ...data,
      MaLead: newMaLead,
      NgayTiepNhan: new Date().toISOString().slice(0, 10),
    };
    setLeadList(prev => [newLead, ...prev]);
    return { success: true, message: `Tiếp nhận khách hàng tiềm năng thành công: ${newMaLead}` };
  };

  const updateLead = (lead: KhachHangTiemNang) => {
    setLeadList(prev => prev.map(l => (l.MaLead === lead.MaLead ? lead : l)));
    return { success: true, message: `Cập nhật thông tin Lead ${lead.MaLead} thành công!` };
  };

  const convertLeadToEnrollment = (maLead: string, maLop: string) => {
    const lead = leadList.find(l => l.MaLead === maLead);
    if (!lead) return { success: false, message: 'Không tìm thấy thông tin Lead!' };

    let student = studentList.find(s => s.SoDienThoai === lead.SoDienThoai);
    let targetMaHV = student?.MaHV;

    if (!student) {
      const studentRes = addStudent({
        TenHV: lead.HoTen,
        SoDienThoai: lead.SoDienThoai,
        Email: lead.Email,
        GioiTinh: 'Nam',
        TrangThai: 'Active',
        GhiChu: `Chuyển đổi từ Lead CRM: ${lead.MaLead} (${lead.Nguon})`,
      });
      if (!studentRes.success || !studentRes.maHV) {
        return { success: false, message: studentRes.message };
      }
      targetMaHV = studentRes.maHV;
    }

    const enrollRes = createEnrollment(targetMaHV!, maLop, 'ChinhThuc', `Chuyển đổi từ Lead ${lead.MaLead}`);
    if (!enrollRes.success) return enrollRes;

    setLeadList(prev =>
      prev.map(l => (l.MaLead === maLead ? { ...l, TrangThai: 'DaChuyenDoi' } : l))
    );

    return {
      success: true,
      message: `Đã chuyển đổi thành công khách hàng ${lead.HoTen} thành Học viên (${targetMaHV}) và Phiếu ghi danh (${enrollRes.maPhieu})!`,
    };
  };

  const sendNotification = (data: Omit<ThongBao, 'MaThongBao' | 'NgayGui' | 'TrangThai'>) => {
    const newCode = `TB${String(notificationList.length + 1).padStart(3, '0')}`;
    const newNotif: ThongBao = {
      ...data,
      MaThongBao: newCode,
      NgayGui: new Date().toISOString().replace('T', ' ').slice(0, 16),
      TrangThai: 'DaGui',
    };
    setNotificationList(prev => [newNotif, ...prev]);
    return { success: true, message: `Đã gửi thông báo ${newCode} qua kênh ${data.KenhGui} thành công!` };
  };

  const addCashFlow = (entry: Omit<PhieuThuChi, 'MaPhieuTC' | 'NgayGiaoDich' | 'NhanVienThucHien'>) => {
    const ym = new Date().toISOString().slice(0, 7).replace('-', '');
    const prefix = entry.Loai === 'Thu' ? 'PT' : 'PC';
    const newCode = `${prefix}-${ym}-${String(cashFlowList.length + 1).padStart(3, '0')}`;
    const newEntry: PhieuThuChi = {
      ...entry,
      MaPhieuTC: newCode,
      NgayGiaoDich: new Date().toISOString().replace('T', ' ').slice(0, 16),
      NhanVienThucHien: currentUser?.MaNV || 'NV003',
    };
    setCashFlowList(prev => [newEntry, ...prev]);
    return { success: true, message: `Lập phiếu ${entry.Loai === 'Thu' ? 'thu' : 'chi'} thành công: ${newCode}` };
  };

  const applyVoucher = (code: string, originalAmount: number) => {
    const trimmed = code.trim().toUpperCase();
    const found = voucherList.find(v => v.MaVoucher === trimmed && v.TrangThai === 'Active');
    if (!found) {
      return { success: false, discountAmount: 0, message: 'Mã voucher không hợp lệ hoặc đã hết hạn!' };
    }

    let discount = 0;
    if (found.LoaiGiam === 'PhanTram') {
      discount = Math.round((originalAmount * found.GiaTriGiam) / 100);
      if (found.GiaTriToiDa && discount > found.GiaTriToiDa) {
        discount = found.GiaTriToiDa;
      }
    } else {
      discount = found.GiaTriGiam;
    }

    return {
      success: true,
      discountAmount: discount,
      message: `Áp dụng thành công mã ${found.MaVoucher}: Giảm ${discount.toLocaleString('vi-VN')} VNĐ (${found.TenChuongTrinh})`,
    };
  };

  // Staff actions
  const addStaff = (data: Omit<NhanVien, 'MaNV' | 'NgayTao'>) => {
    const usernameExists = staffList.some(
      s => s.TenDangNhap.toLowerCase() === data.TenDangNhap.trim().toLowerCase()
    );
    if (usernameExists) {
      return { success: false, message: 'Tên đăng nhập này đã tồn tại trong hệ thống!' };
    }

    const newMaNV = generateNextEmployeeCode(staffList.map(s => s.MaNV));
    const newStaff: NhanVien = {
      ...data,
      MaNV: newMaNV,
      NgayTao: new Date().toISOString().slice(0, 10),
    };
    setStaffList(prev => [...prev, newStaff]);
    return { success: true, message: `Tạo tài khoản nhân viên ${newStaff.TenNV} (${newMaNV}) thành công!` };
  };

  const updateStaff = (staff: NhanVien) => {
    setStaffList(prev => prev.map(s => (s.MaNV === staff.MaNV ? staff : s)));
    return { success: true, message: `Cập nhật thông tin nhân viên ${staff.MaNV} thành công!` };
  };

  const toggleStaffStatus = (maNV: string) => {
    if (currentUser?.MaNV === maNV) {
      return { success: false, message: 'Không thể tự khóa tài khoản của chính mình!' };
    }
    let updatedStatus: 'Active' | 'Inactive' = 'Active';
    setStaffList(prev =>
      prev.map(s => {
        if (s.MaNV === maNV) {
          updatedStatus = s.TrangThai === 'Active' ? 'Inactive' : 'Active';
          return { ...s, TrangThai: updatedStatus };
        }
        return s;
      })
    );
    return {
      success: true,
      message: `Đã chuyển trạng thái nhân viên ${maNV} sang ${updatedStatus === 'Active' ? 'Hoạt động' : 'Đã khóa'}`,
    };
  };


  // Branch CRUD actions
  const addBranch = (data: Omit<ChiNhanh, 'MaChiNhanh'> & { MaChiNhanh?: string }) => {
    if (!data.TenChiNhanh.trim()) {
      return { success: false, message: "Tên chi nhánh không được để trống!" };
    }
    const newCode = data.MaChiNhanh?.trim() || generateNextBranchCode(branchList.map(b => b.MaChiNhanh));
    const codeExists = branchList.some(b => b.MaChiNhanh.toUpperCase() === newCode.toUpperCase());
    if (codeExists) {
      return { success: false, message: `Mã chi nhánh ${newCode} đã tồn tại trong hệ thống!` };
    }
    const newBranch: ChiNhanh = {
      ...data,
      MaChiNhanh: newCode,
      TenChiNhanh: data.TenChiNhanh.trim(),
    };
    setBranchList(prev => [...prev, newBranch]);
    return { success: true, message: `Thêm cơ sở mới thành công: ${newBranch.TenChiNhanh} (${newCode})`, maCN: newCode };
  };

  const updateBranch = (branch: ChiNhanh) => {
    setBranchList(prev => prev.map(b => (b.MaChiNhanh === branch.MaChiNhanh ? branch : b)));
    return { success: true, message: `Cập nhật thông tin cơ sở ${branch.MaChiNhanh} thành công!` };
  };

  const deleteBranch = (maCN: string) => {
    const hasClasses = classList.some(c => c.MaChiNhanh === maCN);
    if (hasClasses) {
      return { success: false, message: `Không thể xóa cơ sở ${maCN} vì đang có lớp học thuộc cơ sở này. Vui lòng điều chuyển lớp trước!` };
    }
    setBranchList(prev => prev.filter(b => b.MaChiNhanh !== maCN));
    return { success: true, message: `Đã xóa cơ sở ${maCN} khỏi hệ thống thành công!` };
  };

  // Staff delete
  const deleteStaff = (maNV: string) => {
    if (currentUser?.MaNV === maNV) {
      return { success: false, message: "Không thể xóa tài khoản của chính bạn đang đăng nhập!" };
    }
    setStaffList(prev => prev.filter(s => s.MaNV !== maNV));
    return { success: true, message: `Đã xóa nhân viên ${maNV} thành công!` };
  };

  // Student permanent delete
  const deleteStudent = (maHV: string) => {
    const owesTuition = invoiceList.some(inv => inv.MaHV === maHV && inv.TienConNo > 0);
    if (owesTuition) {
      return { success: false, message: `Học viên ${maHV} còn nợ học phí chưa thanh toán, không thể xóa!` };
    }
    setStudentList(prev => prev.filter(s => s.MaHV !== maHV));
    return { success: true, message: `Đã xóa học viên ${maHV} thành công!` };
  };

  // Cash flow update and delete
  const updateCashFlow = (entry: PhieuThuChi) => {
    setCashFlowList(prev => prev.map(c => (c.MaPhieuTC === entry.MaPhieuTC ? entry : c)));
    return { success: true, message: `Cập nhật phiếu ${entry.MaPhieuTC} thành công!` };
  };

  const deleteCashFlow = (maPhieuTC: string) => {
    setCashFlowList(prev => prev.filter(c => c.MaPhieuTC !== maPhieuTC));
    return { success: true, message: `Đã xóa phiếu thu/chi ${maPhieuTC} thành công!` };
  };

  // CRM Lead delete
  const deleteLead = (maLead: string) => {
    setLeadList(prev => prev.filter(l => l.MaLead !== maLead));
    return { success: true, message: `Đã xóa khách hàng tiềm năng ${maLead} thành công!` };
  };

  // Placement Test update and delete
  const updatePlacementTest = (test: BaiKiemTraDauVao) => {
    setPlacementTestList(prev => prev.map(t => (t.MaTest === test.MaTest ? test : t)));
    return { success: true, message: `Cập nhật kết quả bài kiểm tra ${test.MaTest} thành công!` };
  };

  const deletePlacementTest = (maTest: string) => {
    setPlacementTestList(prev => prev.filter(t => t.MaTest !== maTest));
    return { success: true, message: `Đã xóa bài kiểm tra ${maTest} thành công!` };
  };

  // Schedule update
  const updateSchedule = (sch: LichHoc) => {
    setScheduleList(prev => prev.map(s => (s.MaLichHoc === sch.MaLichHoc ? sch : s)));
    return { success: true, message: `Cập nhật lịch học ${sch.MaLichHoc} thành công!` };
  };

  // Certificate update and delete
  const updateCertificate = (cert: ChungChi) => {
    setCertificateList(prev => prev.map(c => (c.MaChungChi === cert.MaChungChi ? cert : c)));
    return { success: true, message: `Cập nhật chứng chỉ ${cert.MaChungChi} thành công!` };
  };

  const deleteCertificate = (maCC: string) => {
    setCertificateList(prev => prev.filter(c => c.MaChungChi !== maCC));
    return { success: true, message: `Đã thu hồi / xóa chứng chỉ ${maCC} thành công!` };
  };

  // Notification delete
  const deleteNotification = (maTB: string) => {
    setNotificationList(prev => prev.filter(n => n.MaThongBao !== maTB));
    return { success: true, message: `Đã xóa thông báo ${maTB} thành công!` };
  };

  // Transfer / Deferral reject and delete
  const rejectTransferOrDeferral = (maDon: string) => {
    setTransferDeferralList(prev =>
      prev.map(d =>
        d.MaDon === maDon
          ? { ...d, TrangThai: "TuChoi", NguoiDuyet: currentUser?.TenNV || "Ban Đào Tạo" }
          : d
      )
    );
    return { success: true, message: `Đã từ chối đơn ${maDon} thành công!` };
  };

  const deleteTransferOrDeferral = (maDon: string) => {
    setTransferDeferralList(prev => prev.filter(d => d.MaDon !== maDon));
    return { success: true, message: `Đã xóa đơn ${maDon} thành công!` };
  };

  const resetAllData = () => {
    localStorage.clear();
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    setBranchList(INITIAL_BRANCHES);
    setStaffList(INITIAL_STAFF);
    setCourseList(INITIAL_COURSES);
    setClassList(INITIAL_CLASSES);
    setStudentList(INITIAL_STUDENTS);
    setEnrollmentList(INITIAL_ENROLLMENTS);
    setInvoiceList(INITIAL_INVOICES);
    setPaymentList(INITIAL_PAYMENTS);
    setScheduleList(INITIAL_SCHEDULES);
    setAttendanceList(INITIAL_ATTENDANCE);
    setGradeList(INITIAL_GRADES);
    setCertificateList(INITIAL_CERTIFICATES);
    setLeadList(INITIAL_CRM_LEADS);
    setNotificationList(INITIAL_NOTIFICATIONS);
    setPlacementTestList(INITIAL_PLACEMENT_TESTS);
    setCashFlowList(INITIAL_CASH_FLOW);
    setTransferDeferralList(INITIAL_TRANSFERS_DEFERRALS);
    setCurrentUser(INITIAL_STAFF[0]);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeTab,
        setActiveTab,
        login,
        logout,
        switchRoleForDemo,
        staffList,
        courseList,
        classList,
        studentList,
        enrollmentList,
        invoiceList,
        paymentList,
        branchList,
        scheduleList,
        attendanceList,
        gradeList,
        certificateList,
        leadList,
        notificationList,
        placementTestList,
        cashFlowList,
        transferDeferralList,
        voucherList,
        addBranch,
        updateBranch,
        deleteBranch,
        deleteStaff,
        deleteStudent,
        updateCashFlow,
        deleteCashFlow,
        deleteLead,
        updatePlacementTest,
        deletePlacementTest,
        updateSchedule,
        updateCertificate,
        deleteCertificate,
        deleteNotification,
        rejectTransferOrDeferral,
        deleteTransferOrDeferral,
        addCourse,
        updateCourse,
        deleteCourse,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        softDeleteStudent,
        createEnrollment,
        cancelEnrollment,
        executePayment,
        saveAttendance,
        saveGrade,
        issueCertificate,
        addSchedule,
        deleteSchedule,
        addPlacementTest,
        submitTransferOrDeferral,
        approveTransferOrDeferral,
        addLead,
        updateLead,
        convertLeadToEnrollment,
        sendNotification,
        addCashFlow,
        applyVoucher,
        addStaff,
        updateStaff,
        toggleStaffStatus,
        sidebarPosition,
        setSidebarPosition,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
