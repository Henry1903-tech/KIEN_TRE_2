import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatVND } from '../utils/formatters';
import {
  Database,
  Table,
  Play,
  Download,
  Copy,
  Check,
  RefreshCw,
  Search,
  Code2,
  Terminal,
  ShieldCheck,
  FileCode,
  X,
  FileDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface SqlServerWorkbenchModalProps {
  initialTable?: string;
  onClose: () => void;
}

interface ColumnDef {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkRef?: string;
  nullable: boolean;
  description: string;
}

interface TableMetadata {
  id: string;
  tableName: string;
  displayName: string;
  category: 'Catalog' | 'Operations' | 'Finance' | 'Academic' | 'System';
  description: string;
  columns: ColumnDef[];
  getRecords: (ctx: ReturnType<typeof useApp>) => Record<string, any>[];
  sampleQueries: { name: string; sql: string }[];
}

export const SqlServerWorkbenchModal: React.FC<SqlServerWorkbenchModalProps> = ({
  initialTable = 'HocVien',
  onClose,
}) => {
  const ctx = useApp();
  const [selectedTableId, setSelectedTableId] = useState<string>(initialTable);
  const [activeTab, setActiveTab] = useState<'grid' | 'schema' | 'query' | 'script'>('grid');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<{
    success: boolean;
    columns: string[];
    rows: any[][];
    message: string;
    executionTimeMs: number;
  } | null>(null);

  // TABLES REGISTRY IN DB_KIENTRE_EDU
  const TABLES: TableMetadata[] = useMemo(
    () => [
      {
        id: 'KhoaHoc',
        tableName: 'KhoaHoc',
        displayName: 'Danh mục Khóa học',
        category: 'Catalog',
        description: 'Bảng gốc lưu trữ danh mục khóa học, học phí niêm yết và thời lượng đào tạo.',
        columns: [
          { name: 'MaKH', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã khóa học duy nhất' },
          { name: 'TenKH', type: 'NVARCHAR(200)', nullable: false, description: 'Tên khóa học' },
          { name: 'MoTa', type: 'NVARCHAR(MAX)', nullable: true, description: 'Mô tả mục tiêu khóa học' },
          { name: 'HocPhi', type: 'DECIMAL(15,2)', nullable: false, description: 'Học phí niêm yết (> 0)' },
          { name: 'ThoiLuong', type: 'INT', nullable: false, description: 'Số buổi / giờ học (> 0)' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'Active / Inactive' },
          { name: 'NgayTao', type: 'DATE', nullable: false, description: 'Ngày tạo khóa học' },
        ],
        getRecords: c => c.courseList,
        sampleQueries: [
          { name: 'Khóa học đang mở', sql: "SELECT MaKH, TenKH, HocPhi, ThoiLuong FROM KhoaHoc WHERE TrangThai = 'Active' ORDER BY HocPhi DESC;" },
          { name: 'Thống kê học phí trung bình', sql: "SELECT COUNT(MaKH) AS TongKhoaHoc, AVG(HocPhi) AS HocPhiTrungBinh, MAX(HocPhi) AS HocPhiCaoNhat FROM KhoaHoc;" },
        ],
      },
      {
        id: 'LopHoc',
        tableName: 'LopHoc',
        displayName: 'Quản lý Lớp học',
        category: 'Catalog',
        description: 'Lớp học cụ thể theo khóa, sức chứa, sĩ số và giảng viên phụ trách.',
        columns: [
          { name: 'MaLop', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã lớp học' },
          { name: 'TenLop', type: 'NVARCHAR(200)', nullable: false, description: 'Tên lớp học' },
          { name: 'MaKH', type: 'NVARCHAR(20)', isFk: true, fkRef: 'KhoaHoc(MaKH)', nullable: false, description: 'Khóa học tương ứng' },
          { name: 'NgayKhaiGiang', type: 'DATE', nullable: false, description: 'Ngày bắt đầu khóa' },
          { name: 'NgayKetThuc', type: 'DATE', nullable: false, description: 'Ngày dự kiến kết thúc' },
          { name: 'SucChuaToiDa', type: 'INT', nullable: false, description: 'Sức chứa tối đa của phòng' },
          { name: 'SoLuongDaDangKy', type: 'INT', nullable: false, description: 'Sĩ số hiện tại (Trigger cập nhật)' },
          { name: 'NhanVienDayID', type: 'NVARCHAR(20)', isFk: true, fkRef: 'NhanVien(MaNV)', nullable: false, description: 'Giảng viên phụ trách' },
          { name: 'MaChiNhanh', type: 'NVARCHAR(20)', isFk: true, fkRef: 'ChiNhanh(MaChiNhanh)', nullable: false, description: 'Cơ sở tổ chức' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'DangTuyenSinh / DangHoc / KetThuc' },
        ],
        getRecords: c => c.classList,
        sampleQueries: [
          { name: 'Lớp học còn chỗ trống', sql: "SELECT MaLop, TenLop, SucChuaToiDa, SoLuongDaDangKy, (SucChuaToiDa - SoLuongDaDangKy) AS ChoTrong FROM LopHoc WHERE SoLuongDaDangKy < SucChuaToiDa;" },
          { name: 'Lớp theo Giảng viên (JOIN)', sql: "SELECT L.MaLop, L.TenLop, K.TenKH, N.TenNV AS GiangVien, L.SoLuongDaDangKy FROM LopHoc L INNER JOIN KhoaHoc K ON L.MaKH = K.MaKH INNER JOIN NhanVien N ON L.NhanVienDayID = N.MaNV;" },
        ],
      },
      {
        id: 'HocVien',
        tableName: 'HocVien',
        displayName: 'Hồ sơ Học viên',
        category: 'Operations',
        description: 'Thông tin nhân thân, liên hệ, CCCD và tình trạng học viên.',
        columns: [
          { name: 'MaHV', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã học viên (HVxxx)' },
          { name: 'TenHV', type: 'NVARCHAR(200)', nullable: false, description: 'Họ và tên học viên' },
          { name: 'SoDienThoai', type: 'NVARCHAR(20)', nullable: false, description: 'Số điện thoại liên hệ (UNIQUE)' },
          { name: 'Email', type: 'NVARCHAR(150)', nullable: true, description: 'Thư điện tử học viên' },
          { name: 'CMNDNumber', type: 'NVARCHAR(20)', nullable: true, description: 'CCCD / Định danh công dân' },
          { name: 'NgaySinh', type: 'DATE', nullable: true, description: 'Ngày tháng năm sinh' },
          { name: 'GioiTinh', type: 'NVARCHAR(10)', nullable: false, description: 'Nam / Nữ / Khác' },
          { name: 'DiaChi', type: 'NVARCHAR(250)', nullable: true, description: 'Địa chỉ nơi ở' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'Active / Suspended' },
        ],
        getRecords: c => c.studentList,
        sampleQueries: [
          { name: 'Danh sách học viên đang học', sql: "SELECT MaHV, TenHV, SoDienThoai, Email, GioiTinh FROM HocVien WHERE TrangThai = 'Active' ORDER BY TenHV ASC;" },
          { name: 'Tìm học viên theo SĐT', sql: "SELECT * FROM HocVien WHERE SoDienThoai LIKE '%09%';" },
        ],
      },
      {
        id: 'PhieuGhiDanh',
        tableName: 'PhieuGhiDanh',
        displayName: 'Phiếu Ghi danh & Xếp lớp',
        category: 'Operations',
        description: 'Cầu nối liên kết N-N giữa Học viên và Lớp học kèm snapshot học phí.',
        columns: [
          { name: 'MaPhieuGhiDanh', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã phiếu ghi danh' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Học viên ghi danh' },
          { name: 'MaLop', type: 'NVARCHAR(20)', isFk: true, fkRef: 'LopHoc(MaLop)', nullable: false, description: 'Lớp học xếp vào' },
          { name: 'HocPhi', type: 'DECIMAL(15,2)', nullable: false, description: 'Mức học phí lúc ghi danh' },
          { name: 'LoaiGhiDanh', type: 'NVARCHAR(50)', nullable: false, description: 'ChinhThuc / GiuCho' },
          { name: 'NgayGhiDanh', type: 'DATETIME', nullable: false, description: 'Thời điểm lập phiếu' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'ChinhThuc / GiuCho / DaHuy' },
          { name: 'NhanVienTao', type: 'NVARCHAR(20)', isFk: true, fkRef: 'NhanVien(MaNV)', nullable: false, description: 'Tư vấn viên / Giáo vụ lập' },
        ],
        getRecords: c => c.enrollmentList,
        sampleQueries: [
          { name: 'Phiếu ghi danh chính thức', sql: "SELECT P.MaPhieuGhiDanh, H.TenHV, L.TenLop, P.HocPhi, P.NgayGhiDanh FROM PhieuGhiDanh P INNER JOIN HocVien H ON P.MaHV = H.MaHV INNER JOIN LopHoc L ON P.MaLop = L.MaLop WHERE P.TrangThai = 'ChinhThuc';" },
        ],
      },
      {
        id: 'HoaDon',
        tableName: 'HoaDon',
        displayName: 'Hóa đơn Học phí',
        category: 'Finance',
        description: 'Sổ cái hóa đơn thu học phí, tính toán thực thu, giảm giá và công nợ.',
        columns: [
          { name: 'MaHoaDon', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã hóa đơn' },
          { name: 'MaPhieuGhiDanh', type: 'NVARCHAR(50)', isFk: true, fkRef: 'PhieuGhiDanh(MaPhieuGhiDanh)', nullable: false, description: 'Phiếu ghi danh gốc' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Học viên nộp' },
          { name: 'TongTien', type: 'DECIMAL(15,2)', nullable: false, description: 'Tổng học phí niêm yết' },
          { name: 'TienGiamGia', type: 'DECIMAL(15,2)', nullable: false, description: 'Học bổng / Ưu đãi' },
          { name: 'TienThucThu', type: 'DECIMAL(15,2)', nullable: false, description: 'Tổng số tiền đã đóng' },
          { name: 'TienConNo', type: 'DECIMAL(15,2)', nullable: false, description: 'Khoản nợ còn lại' },
          { name: 'HinhThucThanhToan', type: 'NVARCHAR(50)', nullable: false, description: 'QRCode / TienMat / ChuyenKhoan / TheATM' },
          { name: 'NgayHoaDon', type: 'DATETIME', nullable: false, description: 'Thời điểm xuất hóa đơn' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'DaThanhToan / PartialPay / ChuaThanhToan' },
        ],
        getRecords: c => c.invoiceList,
        sampleQueries: [
          { name: 'Học viên còn nợ học phí', sql: "SELECT H.MaHoaDon, HV.TenHV, H.TongTien, H.TienThucThu, H.TienConNo, H.NgayHanTraNo FROM HoaDon H INNER JOIN HocVien HV ON H.MaHV = HV.MaHV WHERE H.TienConNo > 0 ORDER BY H.TienConNo DESC;" },
          { name: 'Tổng doanh thu thực tế', sql: "SELECT SUM(TienThucThu) AS DoanhThuThucThu, SUM(TienConNo) AS TongCongNoChuaThu, COUNT(MaHoaDon) AS SoLuongHoaDon FROM HoaDon;" },
        ],
      },
      {
        id: 'LichSuThanhToan',
        tableName: 'LichSuThanhToan',
        displayName: 'Lịch sử Thanh toán (Audit Log)',
        category: 'Finance',
        description: 'Bản ghi giao dịch bất biến (Immutable Audit) ghi nhận từng đợt đóng tiền.',
        columns: [
          { name: 'MaThanhToan', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã biên lai giao dịch' },
          { name: 'MaHoaDon', type: 'NVARCHAR(50)', isFk: true, fkRef: 'HoaDon(MaHoaDon)', nullable: false, description: 'Hóa đơn tương ứng' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Học viên đóng' },
          { name: 'SoTienThanhToan', type: 'DECIMAL(15,2)', nullable: false, description: 'Số tiền nộp lần này (> 0)' },
          { name: 'HinhThucThanhToan', type: 'NVARCHAR(50)', nullable: false, description: 'QRCode / ChuyenKhoan / TienMat / TheATM' },
          { name: 'NgayThanhToan', type: 'DATETIME', nullable: false, description: 'Thời điểm nộp tiền' },
          { name: 'NhanVienThu', type: 'NVARCHAR(20)', isFk: true, fkRef: 'NhanVien(MaNV)', nullable: false, description: 'Kế toán thực hiện' },
          { name: 'MaGiaoDich', type: 'NVARCHAR(100)', nullable: true, description: 'Mã tra soát ngân hàng / VietQR' },
        ],
        getRecords: c => c.paymentList,
        sampleQueries: [
          { name: 'Giao dịch VietQR & Chuyển khoản', sql: "SELECT MaThanhToan, MaHoaDon, SoTienThanhToan, HinhThucThanhToan, NgayThanhToan, MaGiaoDich FROM LichSuThanhToan WHERE HinhThucThanhToan IN ('QRCode', 'ChuyenKhoan') ORDER BY NgayThanhToan DESC;" },
        ],
      },
      {
        id: 'SoQuyThuChi',
        tableName: 'SoQuyThuChi',
        displayName: 'Sổ quỹ Thu - Chi Tiền mặt & Ngân hàng',
        category: 'Finance',
        description: 'Phiếu thu, phiếu chi hoạt động vận hành, thù lao giảng viên, mặt bằng cơ sở.',
        columns: [
          { name: 'MaPhieuTC', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã phiếu thu/chi (PT/PC)' },
          { name: 'Loai', type: 'NVARCHAR(10)', nullable: false, description: 'Thu / Chi' },
          { name: 'HangMuc', type: 'NVARCHAR(50)', nullable: false, description: 'ThuHocPhi / ChiLuongGiangVien / ChiThueMatBang / ChiMarketing...' },
          { name: 'TenHangMuc', type: 'NVARCHAR(250)', nullable: false, description: 'Diễn giải nội dung giao dịch' },
          { name: 'SoTien', type: 'DECIMAL(15,2)', nullable: false, description: 'Số tiền phát sinh (> 0)' },
          { name: 'HinhThuc', type: 'NVARCHAR(50)', nullable: false, description: 'TienMat / ChuyenKhoan' },
          { name: 'NgayGiaoDich', type: 'DATETIME', nullable: false, description: 'Thời điểm giao dịch' },
          { name: 'NguoiGiaoDich', type: 'NVARCHAR(100)', nullable: false, description: 'Người nhận tiền / nộp tiền' },
          { name: 'MaChiNhanh', type: 'NVARCHAR(20)', isFk: true, fkRef: 'ChiNhanh(MaChiNhanh)', nullable: false, description: 'Cơ sở phát sinh chi phí' },
        ],
        getRecords: c => c.cashFlowList,
        sampleQueries: [
          { name: 'Cân đối Thu - Chi Quỹ', sql: "SELECT Loai, COUNT(MaPhieuTC) AS SoPhieu, SUM(SoTien) AS TongTien FROM SoQuyThuChi GROUP BY Loai;" },
        ],
      },
      {
        id: 'DiemSo',
        tableName: 'DiemSo',
        displayName: 'Bảng điểm & Đánh giá môn học',
        category: 'Academic',
        description: 'Điểm chuyên cần, giữa kỳ, cuối kỳ, xếp loại và công nhận qua môn.',
        columns: [
          { name: 'MaDiem', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã bảng điểm' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Học viên' },
          { name: 'MaLop', type: 'NVARCHAR(20)', isFk: true, fkRef: 'LopHoc(MaLop)', nullable: false, description: 'Lớp học' },
          { name: 'DiemChuyenCan', type: 'DECIMAL(4,2)', nullable: false, description: 'Điểm chuyên cần (0-10)' },
          { name: 'DiemGiuaKy', type: 'DECIMAL(4,2)', nullable: false, description: 'Điểm thi giữa kỳ (0-10)' },
          { name: 'DiemCuoiKy', type: 'DECIMAL(4,2)', nullable: false, description: 'Điểm thi cuối kỳ (0-10)' },
          { name: 'DiemTongKet', type: 'DECIMAL(4,2)', nullable: false, description: 'Điểm tổng kết trọng số' },
          { name: 'XepLoai', type: 'NVARCHAR(50)', nullable: false, description: 'Xuất sắc / Giỏi / Khá / Trung bình' },
          { name: 'TrangThaiQuaMon', type: 'BIT', nullable: false, description: '1 (Qua môn) / 0 (Học lại)' },
        ],
        getRecords: c => c.gradeList,
        sampleQueries: [
          { name: 'Học viên đạt loại Giỏi & Xuất sắc', sql: "SELECT D.MaDiem, H.TenHV, D.MaLop, D.DiemTongKet, D.XepLoai FROM DiemSo D INNER JOIN HocVien H ON D.MaHV = H.MaHV WHERE D.DiemTongKet >= 8.0 ORDER BY D.DiemTongKet DESC;" },
        ],
      },
      {
        id: 'LichHoc',
        tableName: 'LichHoc',
        displayName: 'Thời khóa biểu phòng học',
        category: 'Academic',
        description: 'Phân ca, thứ trong tuần, phòng học và giảng viên giảng dạy.',
        columns: [
          { name: 'MaLichHoc', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã lịch học' },
          { name: 'MaLop', type: 'NVARCHAR(20)', isFk: true, fkRef: 'LopHoc(MaLop)', nullable: false, description: 'Lớp học' },
          { name: 'ThuTrongTuan', type: 'NVARCHAR(20)', nullable: false, description: 'Thứ 2, Thứ 3...' },
          { name: 'GioBatDau', type: 'NVARCHAR(10)', nullable: false, description: 'Giờ bắt đầu ca' },
          { name: 'GioKetThuc', type: 'NVARCHAR(10)', nullable: false, description: 'Giờ kết thúc ca' },
          { name: 'PhongHoc', type: 'NVARCHAR(100)', nullable: false, description: 'Phòng học / Phòng máy Lab' },
          { name: 'GiangVienID', type: 'NVARCHAR(20)', isFk: true, fkRef: 'NhanVien(MaNV)', nullable: false, description: 'Giảng viên đứng lớp' },
        ],
        getRecords: c => c.scheduleList,
        sampleQueries: [
          { name: 'Lịch học phòng Lab 101', sql: "SELECT * FROM LichHoc WHERE PhongHoc LIKE '%Lab 101%' ORDER BY ThuTrongTuan;" },
        ],
      },
      {
        id: 'NhanVien',
        tableName: 'NhanVien',
        displayName: 'Nhân sự & Tài khoản RBAC',
        category: 'System',
        description: 'Tài khoản đăng nhập, mật khẩu băm SHA-256, vai trò và phân quyền.',
        columns: [
          { name: 'MaNV', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã nhân viên' },
          { name: 'TenNV', type: 'NVARCHAR(200)', nullable: false, description: 'Họ và tên nhân viên' },
          { name: 'TenDangNhap', type: 'NVARCHAR(100)', nullable: false, description: 'Username (UNIQUE)' },
          { name: 'Email', type: 'NVARCHAR(150)', nullable: false, description: 'Email công vụ (@kientre.edu.vn)' },
          { name: 'VaiTro', type: 'NVARCHAR(50)', nullable: false, description: 'Admin / GiaoVu / KeToan / GiangVien' },
          { name: 'BoPhong', type: 'NVARCHAR(100)', nullable: false, description: 'Ban Giám Đốc / Giáo Vụ / Kế Toán...' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'Active / Suspended' },
        ],
        getRecords: c => c.staffList,
        sampleQueries: [
          { name: 'Danh sách nhân sự KIẾN TRẺ', sql: "SELECT MaNV, TenNV, Email, VaiTro, BoPhong FROM NhanVien WHERE TrangThai = 'Active' ORDER BY VaiTro;" },
        ],
      },
      {
        id: 'ChiNhanh',
        tableName: 'ChiNhanh',
        displayName: 'Mạng lưới Cơ sở & Chi nhánh',
        category: 'System',
        description: 'Địa điểm cơ sở, phòng học, hotline và nhân sự quản lý cơ sở.',
        columns: [
          { name: 'MaChiNhanh', type: 'NVARCHAR(20)', isPk: true, nullable: false, description: 'Mã chi nhánh' },
          { name: 'TenChiNhanh', type: 'NVARCHAR(200)', nullable: false, description: 'Tên cơ sở' },
          { name: 'DiaChi', type: 'NVARCHAR(250)', nullable: false, description: 'Địa chỉ trụ sở' },
          { name: 'SoDienThoai', type: 'NVARCHAR(20)', nullable: false, description: 'Hotline cơ sở' },
          { name: 'QuanLyID', type: 'NVARCHAR(20)', isFk: true, fkRef: 'NhanVien(MaNV)', nullable: false, description: 'Giám đốc chi nhánh' },
        ],
        getRecords: c => c.branchList,
        sampleQueries: [
          { name: 'Cơ sở đào tạo KIẾN TRẺ', sql: "SELECT C.MaChiNhanh, C.TenChiNhanh, C.DiaChi, N.TenNV AS GiamDocCoSo FROM ChiNhanh C LEFT JOIN NhanVien N ON C.QuanLyID = N.MaNV;" },
        ],
      },
      {
        id: 'KhachHangTiemNang',
        tableName: 'KhachHangTiemNang',
        displayName: 'CRM & Khách hàng Tuyển sinh',
        category: 'Operations',
        description: 'Leads tư vấn tuyển sinh từ Facebook, Website, Workshop, giới thiệu.',
        columns: [
          { name: 'MaLead', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã lead CRM' },
          { name: 'HoTen', type: 'NVARCHAR(200)', nullable: false, description: 'Họ tên khách hàng' },
          { name: 'SoDienThoai', type: 'NVARCHAR(20)', nullable: false, description: 'Số điện thoại' },
          { name: 'KhoaHocQuanTam', type: 'NVARCHAR(200)', nullable: false, description: 'Khóa học tư vấn' },
          { name: 'Nguon', type: 'NVARCHAR(50)', nullable: false, description: 'Facebook / Website / Workshop' },
          { name: 'MucDoTiemNang', type: 'NVARCHAR(50)', nullable: false, description: 'Cần học gấp / Đang cân nhắc / Hỏi tham khảo thông tin' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'Moi / DangTuVan / DaHenLich / DaDangKy' },
        ],
        getRecords: c => c.leadList,
        sampleQueries: [
          { name: 'Leads Cần học gấp cần chốt ghi danh', sql: "SELECT MaLead, HoTen, SoDienThoai, KhoaHocQuanTam, TrangThai FROM KhachHangTiemNang WHERE MucDoTiemNang = 'Cần học gấp' OR MucDoTiemNang = 'Nong' ORDER BY MaLead DESC;" },
        ],
      },
      {
        id: 'DiemDanh',
        tableName: 'DiemDanh',
        displayName: 'Điểm danh & Chuyên cần',
        category: 'Academic',
        description: 'Nhật ký chuyên cần từng buổi học của từng học viên.',
        columns: [
          { name: 'MaDiemDanh', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã bản ghi điểm danh' },
          { name: 'MaLop', type: 'NVARCHAR(20)', isFk: true, fkRef: 'LopHoc(MaLop)', nullable: false, description: 'Mã lớp học' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Mã học viên' },
          { name: 'NgayDiemDanh', type: 'DATE', nullable: false, description: 'Ngày học' },
          { name: 'CoMat', type: 'BIT', nullable: false, description: '1: Có mặt / 0: Vắng' },
          { name: 'CoPhep', type: 'BIT', nullable: false, description: '1: Có phép / 0: Không phép' },
          { name: 'GhiChu', type: 'NVARCHAR(250)', nullable: true, description: 'Ghi chú lý do vắng / đi trễ' },
        ],
        getRecords: c => c.attendanceList,
        sampleQueries: [
          { name: 'Tỷ lệ chuyên cần theo lớp', sql: "SELECT MaLop, COUNT(MaDiemDanh) AS TongBuoi, SUM(CASE WHEN CoMat = 1 THEN 1 ELSE 0 END) AS CoMatCount FROM DiemDanh GROUP BY MaLop;" },
        ],
      },
      {
        id: 'BaiKiemTraDauVao',
        tableName: 'BaiKiemTraDauVao',
        displayName: 'Thi xếp lớp & Đánh giá năng lực đầu vào',
        category: 'Academic',
        description: 'Kết quả test 4 kỹ năng xếp lớp chuẩn quốc tế cho học viên mới.',
        columns: [
          { name: 'MaTest', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã bài thi kiểm tra' },
          { name: 'HoTen', type: 'NVARCHAR(200)', nullable: false, description: 'Họ tên thí sinh' },
          { name: 'SoDienThoai', type: 'NVARCHAR(20)', nullable: false, description: 'SĐT liên lạc' },
          { name: 'Email', type: 'NVARCHAR(150)', nullable: true, description: 'Email' },
          { name: 'NgayThi', type: 'DATE', nullable: false, description: 'Ngày làm bài test' },
          { name: 'DiemNghe', type: 'DECIMAL(3,1)', nullable: false, description: 'Điểm Listening (0-9)' },
          { name: 'DiemDoc', type: 'DECIMAL(3,1)', nullable: false, description: 'Điểm Reading (0-9)' },
          { name: 'DiemViet', type: 'DECIMAL(3,1)', nullable: false, description: 'Điểm Writing (0-9)' },
          { name: 'DiemNoi', type: 'DECIMAL(3,1)', nullable: false, description: 'Điểm Speaking (0-9)' },
          { name: 'DiemTongHop', type: 'DECIMAL(3,1)', nullable: false, description: 'Điểm tổng hợp overall' },
          { name: 'DeXuatKhoaHoc', type: 'NVARCHAR(200)', nullable: false, description: 'Khóa học đề xuất phù hợp' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'DaCham / DangCham / DaXepLop' },
        ],
        getRecords: c => c.placementTestList,
        sampleQueries: [
          { name: 'Học viên đạt IELTS >= 6.0', sql: "SELECT HoTen, SoDienThoai, DiemTongHop, DeXuatKhoaHoc FROM BaiKiemTraDauVao WHERE DiemTongHop >= 6.0 ORDER BY DiemTongHop DESC;" },
        ],
      },
      {
        id: 'DonBaoLuuChuyenLop',
        tableName: 'DonBaoLuuChuyenLop',
        displayName: 'Đơn Bảo lưu & Chuyển lớp',
        category: 'Operations',
        description: 'Xử lý các nghiệp vụ biến động đào tạo, bảo lưu học phí và chuyển cơ sở.',
        columns: [
          { name: 'MaDon', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã đơn' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Mã học viên' },
          { name: 'LoaiDon', type: 'NVARCHAR(50)', nullable: false, description: 'BaoLuu / ChuyenLop' },
          { name: 'MaLopCu', type: 'NVARCHAR(20)', isFk: true, fkRef: 'LopHoc(MaLop)', nullable: false, description: 'Lớp hiện tại' },
          { name: 'MaLopMoi', type: 'NVARCHAR(20)', nullable: true, description: 'Lớp chuyển sang (nếu có)' },
          { name: 'NgayNop', type: 'DATE', nullable: false, description: 'Ngày nộp đơn' },
          { name: 'HanBaoLuu', type: 'DATE', nullable: true, description: 'Hạn chót bảo lưu (tối đa 6 tháng)' },
          { name: 'TrangThai', type: 'NVARCHAR(50)', nullable: false, description: 'ChoDuyet / DaDuyet / TuChoi' },
          { name: 'LyDo', type: 'NVARCHAR(500)', nullable: true, description: 'Lý do cá nhân' },
        ],
        getRecords: c => c.transferDeferralList,
        sampleQueries: [
          { name: 'Đơn bảo lưu đang chờ duyệt', sql: "SELECT D.MaDon, H.TenHV, D.LoaiDon, D.NgayNop, D.LyDo FROM DonBaoLuuChuyenLop D INNER JOIN HocVien H ON D.MaHV = H.MaHV WHERE D.TrangThai = 'ChoDuyet';" },
        ],
      },
      {
        id: 'HopDongDaoTao',
        tableName: 'HopDongDaoTao',
        displayName: 'Hợp đồng Đào tạo & Cam kết Đầu ra',
        category: 'Operations',
        description: 'Văn bản hợp đồng đào tạo pháp lý có chữ ký số điện tử và cam kết chất lượng KIẾN TRẺ.',
        columns: [
          { name: 'MaHopDong', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã hợp đồng đào tạo' },
          { name: 'MaPhieuGhiDanh', type: 'NVARCHAR(50)', isFk: true, fkRef: 'PhieuGhiDanh(MaPhieuGhiDanh)', nullable: false, description: 'Phiếu ghi danh' },
          { name: 'MaHV', type: 'NVARCHAR(20)', isFk: true, fkRef: 'HocVien(MaHV)', nullable: false, description: 'Học viên ký kết' },
          { name: 'MaLop', type: 'NVARCHAR(20)', isFk: true, fkRef: 'LopHoc(MaLop)', nullable: false, description: 'Lớp học đào tạo' },
          { name: 'NgayKy', type: 'DATE', nullable: false, description: 'Ngày ký kết' },
          { name: 'DaiDienPhapLy', type: 'NVARCHAR(150)', nullable: false, description: 'Người đại diện Bên A (TS. Lâm Hoàng Trúc Mai)' },
          { name: 'CamKetDauRa', type: 'NVARCHAR(500)', nullable: false, description: 'Chuẩn cam kết đầu ra đào tạo' },
          { name: 'TrangThaiKy', type: 'NVARCHAR(50)', nullable: false, description: 'DaKy / ChoKy' },
        ],
        getRecords: c =>
          c.enrollmentList.map((e, idx) => ({
            MaHopDong: `HDDT-KT-${e.MaPhieuGhiDanh.replace('PGD-', '')}`,
            MaPhieuGhiDanh: e.MaPhieuGhiDanh,
            MaHV: e.MaHV,
            MaLop: e.MaLop,
            NgayKy: e.NgayGhiDanh.slice(0, 10),
            DaiDienPhapLy: 'TS. Lâm Hoàng Trúc Mai (GĐ KIẾN TRẺ)',
            CamKetDauRa: 'Đạt chuẩn chứng chỉ đầu ra quốc tế và hỗ trợ việc làm',
            TrangThaiKy: idx % 3 === 0 ? 'ChoKy' : 'DaKy',
          })),
        sampleQueries: [
          { name: 'Hợp đồng đào tạo đã hoàn tất ký', sql: "SELECT * FROM HopDongDaoTao WHERE TrangThaiKy = 'DaKy' ORDER BY NgayKy DESC;" },
        ],
      },
      {
        id: 'ThongBao',
        tableName: 'ThongBao',
        displayName: 'Thông báo & Tin nhắn hệ thống',
        category: 'System',
        description: 'Kênh phát thông báo nội bộ, nhắc lịch đóng học phí và thông tin lớp.',
        columns: [
          { name: 'MaThongBao', type: 'NVARCHAR(50)', isPk: true, nullable: false, description: 'Mã thông báo' },
          { name: 'TieuDe', type: 'NVARCHAR(250)', nullable: false, description: 'Tiêu đề thông báo' },
          { name: 'NoiDung', type: 'NVARCHAR(MAX)', nullable: false, description: 'Nội dung chi tiết' },
          { name: 'Loai', type: 'NVARCHAR(50)', nullable: false, description: 'HocPhi / LopHoc / LichThi / HeThong' },
          { name: 'NgayGui', type: 'DATETIME', nullable: false, description: 'Thời điểm phát' },
          { name: 'NguoiGui', type: 'NVARCHAR(100)', nullable: false, description: 'Tác giả' },
        ],
        getRecords: c => c.notificationList,
        sampleQueries: [
          { name: 'Thông báo học phí & lớp học', sql: "SELECT MaThongBao, TieuDe, Loai, NgayGui FROM ThongBao ORDER BY NgayGui DESC;" },
        ],
      },
    ],
    []
  );

  const activeTableMeta = TABLES.find(t => t.id === selectedTableId) || TABLES[0];
  const tableRecords = activeTableMeta.getRecords(ctx);

  // Filter records based on search
  const filteredRecords = useMemo(() => {
    if (!searchFilter.trim()) return tableRecords;
    const query = searchFilter.toLowerCase();
    return tableRecords.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );
  }, [tableRecords, searchFilter]);

  // Set default query when switching table
  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    const target = TABLES.find(t => t.id === tableId);
    if (target && target.sampleQueries.length > 0) {
      setCustomQuery(target.sampleQueries[0].sql);
    } else {
      setCustomQuery(`SELECT * FROM ${target?.tableName || 'HocVien'};`);
    }
    setQueryResult(null);
  };

  // Execute interactive T-SQL simulated query
  const handleExecuteQuery = () => {
    const startTime = performance.now();
    const sql = customQuery.trim();

    try {
      if (!sql) {
        setQueryResult({
          success: false,
          columns: [],
          rows: [],
          message: 'Lỗi: Câu truy vấn T-SQL trống.',
          executionTimeMs: 0,
        });
        return;
      }

      // Simplified smart execution for previewing SQL Server data
      const records = activeTableMeta.getRecords(ctx);
      let rows = [...records];

      // Simple WHERE filter simulation if specified
      if (sql.toUpperCase().includes('WHERE')) {
        const whereIndex = sql.toUpperCase().indexOf('WHERE');
        const condition = sql.slice(whereIndex + 5).split(/ORDER BY|GROUP BY|;/i)[0].trim();

        if (condition.includes('=')) {
          const [left, right] = condition.split('=').map(s => s.trim().replace(/['"]/g, ''));
          rows = rows.filter(r => String(r[left])?.toLowerCase() === right.toLowerCase());
        } else if (condition.toUpperCase().includes('LIKE')) {
          const parts = condition.split(/LIKE/i).map(s => s.trim().replace(/['"%]/g, ''));
          const col = parts[0];
          const term = parts[1] || '';
          rows = rows.filter(r => String(r[col])?.toLowerCase().includes(term.toLowerCase()));
        } else if (condition.includes('> 0')) {
          const col = condition.split('> 0')[0].trim();
          rows = rows.filter(r => Number(r[col]) > 0);
        }
      }

      // Projection: check if columns are specified
      let cols: string[] = [];
      const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
      if (selectMatch && selectMatch[1] && selectMatch[1].trim() !== '*') {
        const rawCols = selectMatch[1].split(',').map(c => c.trim().split(/\s+AS\s+/i)[0].trim());
        cols = rawCols;
      } else {
        cols = activeTableMeta.columns.map(c => c.name);
      }

      const projectedRows = rows.map(item => cols.map(c => item[c] ?? '—'));
      const executionTime = Math.round(performance.now() - startTime + 4);

      setQueryResult({
        success: true,
        columns: cols,
        rows: projectedRows,
        message: `Command(s) completed successfully. (${rows.length} row(s) affected). Execution time: ${executionTime}ms. Server: SQL Server 2022 (DB_KIENTRE_EDU).`,
        executionTimeMs: executionTime,
      });
    } catch (err: any) {
      setQueryResult({
        success: false,
        columns: [],
        rows: [],
        message: `Msg 102, Level 15, State 1: Incorrect syntax near query. Details: ${err.message}`,
        executionTimeMs: 0,
      });
    }
  };

  // Generate T-SQL DDL & DML script for this specific table
  const generateTableSqlScript = (): string => {
    const t = activeTableMeta;
    let sql = `-- ==========================================================================\n`;
    sql += `-- CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ\n`;
    sql += `-- HỆ THỐNG QUẢN TRỊ ĐÀO TẠO & KINH DOANH DỊCH VỤ GIÁO DỤC\n`;
    sql += `-- BẢNG DỮ LIỆU: [dbo].[${t.tableName}]\n`;
    sql += `-- ==========================================================================\n\n`;
    sql += `USE [DB_KIENTRE_EDU];\nGO\n\n`;
    sql += `-- 1. Tạo cấu trúc Bảng [${t.tableName}]\n`;
    sql += `IF OBJECT_ID('dbo.${t.tableName}', 'U') IS NOT NULL\n`;
    sql += `    DROP TABLE dbo.${t.tableName};\nGO\n\n`;
    sql += `CREATE TABLE [dbo].[${t.tableName}] (\n`;

    const colLines = t.columns.map(c => {
      let line = `    [${c.name}] ${c.type}`;
      if (!c.nullable) line += ' NOT NULL';
      if (c.isPk) line += ` CONSTRAINT [PK_${t.tableName}_${c.name}] PRIMARY KEY`;
      return line;
    });

    sql += colLines.join(',\n');
    sql += `\n);\nGO\n\n`;

    sql += `-- 2. Nạp dữ liệu thực tế (INSERT DML)\n`;
    const records = t.getRecords(ctx);
    if (records.length > 0) {
      const colNames = t.columns.map(c => `[${c.name}]`).join(', ');
      records.forEach(r => {
        const valList = t.columns.map(c => {
          const val = r[c.name];
          if (val === undefined || val === null) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return `N'${String(val).replace(/'/g, "''")}'`;
        });
        sql += `INSERT INTO [dbo].[${t.tableName}] (${colNames}) VALUES (${valList.join(', ')});\n`;
      });
      sql += `GO\n\n`;
    }

    sql += `-- 3. Truy vấn kiểm tra dữ liệu\n`;
    sql += `SELECT COUNT(*) AS [TongSoBanGhi] FROM [dbo].[${t.tableName}];\n`;
    sql += `SELECT TOP 20 * FROM [dbo].[${t.tableName}];\nGO\n`;

    return sql;
  };

  // Download entire database SQL Server script
  const handleDownloadFullDatabaseSql = () => {
    let script = `-- ==========================================================================\n`;
    script += `-- ĐỀ TÀI: PHÂN TÍCH, THIẾT KẾ VÀ XÂY DỰNG HỆ THỐNG QUẢN TRỊ ĐÀO TẠO\n`;
    script += `--         VÀ KINH DOANH DỊCH VỤ GIÁO DỤC TẠI CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ\n`;
    script += `-- CƠ SỞ DỮ LIỆU: DB_KIENTRE_EDU (Chuẩn BCNF - MS SQL SERVER)\n`;
    script += `-- NGÀY XUẤT BẢN: ${new Date().toISOString().slice(0, 10)}\n`;
    script += `-- ==========================================================================\n\n`;
    script += `USE master;\nGO\n\n`;
    script += `IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DB_KIENTRE_EDU')\n`;
    script += `BEGIN\n    CREATE DATABASE [DB_KIENTRE_EDU];\nEND\nGO\n\n`;
    script += `USE [DB_KIENTRE_EDU];\nGO\n\n`;

    TABLES.forEach(t => {
      script += `-- -----------------------------------------------------\n`;
      script += `-- TABLE: [dbo].[${t.tableName}] (${t.displayName})\n`;
      script += `-- -----------------------------------------------------\n`;
      script += `IF OBJECT_ID('dbo.${t.tableName}', 'U') IS NOT NULL DROP TABLE dbo.${t.tableName};\nGO\n`;
      script += `CREATE TABLE [dbo].[${t.tableName}] (\n`;
      const colLines = t.columns.map(c => {
        let line = `    [${c.name}] ${c.type}`;
        if (!c.nullable) line += ' NOT NULL';
        if (c.isPk) line += ` PRIMARY KEY`;
        return line;
      });
      script += colLines.join(',\n') + `\n);\nGO\n\n`;

      const records = t.getRecords(ctx);
      if (records.length > 0) {
        const colNames = t.columns.map(c => `[${c.name}]`).join(', ');
        records.forEach(r => {
          const valList = t.columns.map(c => {
            const val = r[c.name];
            if (val === undefined || val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return `N'${String(val).replace(/'/g, "''")}'`;
          });
          script += `INSERT INTO [dbo].[${t.tableName}] (${colNames}) VALUES (${valList.join(', ')});\n`;
        });
        script += `GO\n\n`;
      }
    });

    // Stored Procedure
    script += `-- ==========================================================================\n`;
    script += `-- STORED PROCEDURES NGHIỆP VỤ\n`;
    script += `-- ==========================================================================\n`;
    script += `CREATE OR ALTER PROCEDURE [dbo].[SP_ThanhToanHocPhi]\n`;
    script += `    @MaHoaDon NVARCHAR(50),\n`;
    script += `    @SoTienThanhToan DECIMAL(15,2),\n`;
    script += `    @HinhThucThanhToan NVARCHAR(50),\n`;
    script += `    @NhanVienThu NVARCHAR(20),\n`;
    script += `    @MaGiaoDich NVARCHAR(100) = NULL\n`;
    script += `AS\nBEGIN\n    SET NOCOUNT ON;\n    BEGIN TRANSACTION;\n    BEGIN TRY\n`;
    script += `        DECLARE @MaHV NVARCHAR(20), @ConNoHienTai DECIMAL(15,2);\n`;
    script += `        SELECT @MaHV = MaHV, @ConNoHienTai = TienConNo FROM HoaDon WHERE MaHoaDon = @MaHoaDon;\n`;
    script += `        IF @ConNoHienTai IS NULL RAISERROR(N'Hóa đơn không tồn tại!', 16, 1);\n`;
    script += `        IF @SoTienThanhToan <= 0 OR @SoTienThanhToan > @ConNoHienTai RAISERROR(N'Số tiền thanh toán không hợp lệ!', 16, 1);\n`;
    script += `        DECLARE @MaTT NVARCHAR(50) = 'TT-' + CONVERT(NVARCHAR(8), GETDATE(), 112) + '-' + RIGHT(NEWID(), 4);\n`;
    script += `        INSERT INTO LichSuThanhToan (MaThanhToan, MaHoaDon, MaHV, SoTienThanhToan, HinhThucThanhToan, NgayThanhToan, NhanVienThu, MaGiaoDich)\n`;
    script += `        VALUES (@MaTT, @MaHoaDon, @MaHV, @SoTienThanhToan, @HinhThucThanhToan, GETDATE(), @NhanVienThu, @MaGiaoDich);\n`;
    script += `        DECLARE @ConNoMoi DECIMAL(15,2) = @ConNoHienTai - @SoTienThanhToan;\n`;
    script += `        UPDATE HoaDon SET TienThucThu = TienThucThu + @SoTienThanhToan, TienConNo = @ConNoMoi, TrangThai = CASE WHEN @ConNoMoi = 0 THEN 'DaThanhToan' ELSE 'PartialPay' END WHERE MaHoaDon = @MaHoaDon;\n`;
    script += `        COMMIT TRANSACTION;\n    END TRY\n    BEGIN CATCH\n        ROLLBACK TRANSACTION;\n        THROW;\n    END CATCH\nEND;\nGO\n\n`;

    const blob = new Blob([script], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DB_KIENTRE_EDU_FullScript_SQLServer.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTableSql = () => {
    const sql = generateTableSqlScript();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DB_KIENTRE_${activeTableMeta.tableName}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(generateTableSqlScript());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white shadow-sm">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  SQL Server Workbench · KIẾN TRẺ EDU
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  DB_KIENTRE_EDU
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                  T-SQL (BCNF Model)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xl">
                Cơ sở dữ liệu quan hệ đồng bộ trực tiếp với các phân hệ nghiệp vụ của Công ty CP Đầu tư Giáo dục KIẾN TRẺ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFullDatabaseSql}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition shadow-xs"
              title="Xuất trọn bộ file .sql nộp đồ án / chạy trên SSMS"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Tải Full Database (.sql)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Left sidebar tables list + Right content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Table Selector */}
          <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="p-3 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Bảng CSDL ({TABLES.length} bảng)
              </div>
              {TABLES.map(t => {
                const count = t.getRecords(ctx).length;
                const isSelected = selectedTableId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTable(t.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors font-mono ${
                      isSelected
                        ? 'bg-blue-600/90 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{t.tableName}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold ${
                        isSelected
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Helper */}
            <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 bg-slate-950">
              <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Ràng buộc toàn vẹn
              </div>
              <div>Khóa ngoại [FK] bảo đảm tính nhất quán dữ liệu giữa các form.</div>
            </div>
          </aside>

          {/* Right Content Panel */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
            {/* Table Meta Bar & Tabs */}
            <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                    <span>dbo.[{activeTableMeta.tableName}]</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-sans">
                    — {activeTableMeta.displayName} ({tableRecords.length} dòng dữ liệu)
                  </span>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('grid')}
                  className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Dữ liệu Grid ({tableRecords.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('query')}
                  className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'query'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Truy vấn T-SQL</span>
                </button>

                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'schema'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cấu trúc Cột ({activeTableMeta.columns.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'script'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Script T-SQL (.sql)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DATA GRID (SSMS VIEW) */}
            {activeTab === 'grid' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Bar & Actions */}
                <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder={`Tìm nhanh trong bảng ${activeTableMeta.tableName}...`}
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadTableSql}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                      title="Xuất script bảng hiện tại ra file .sql"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Xuất bảng .sql</span>
                    </button>
                  </div>
                </div>

                {/* Table Data Viewport */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead className="sticky top-0 bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 select-none">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center text-slate-600 bg-slate-950/90 border-r border-slate-800">
                          #
                        </th>
                        {activeTableMeta.columns.map(col => (
                          <th
                            key={col.name}
                            className="py-2.5 px-3 border-r border-slate-800 whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1">
                              <span className={col.isPk ? 'text-amber-400 font-bold' : col.isFk ? 'text-cyan-400' : 'text-slate-200'}>
                                {col.name}
                              </span>
                              {col.isPk && <span className="text-[9px] bg-amber-950 text-amber-300 px-1 rounded">PK</span>}
                              {col.isFk && <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 rounded">FK</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal font-sans">
                              {col.type}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={activeTableMeta.columns.length + 1}
                            className="py-12 text-center text-slate-500 font-sans"
                          >
                            Không có dòng dữ liệu nào khớp với điều kiện tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-1.5 px-3 text-center text-slate-500 border-r border-slate-800/60 select-none text-[11px]">
                              {idx + 1}
                            </td>
                            {activeTableMeta.columns.map(col => {
                              const val = row[col.name];
                              const isMoney = col.type.includes('DECIMAL') && typeof val === 'number';
                              return (
                                <td
                                  key={col.name}
                                  className="py-1.5 px-3 border-r border-slate-800/60 whitespace-nowrap text-[11px]"
                                >
                                  {isMoney ? (
                                    <span className="text-emerald-400 font-semibold">
                                      {formatVND(val)}
                                    </span>
                                  ) : val === null || val === undefined ? (
                                    <span className="text-slate-600 italic">NULL</span>
                                  ) : typeof val === 'boolean' ? (
                                    val ? (
                                      <span className="text-emerald-400">TRUE (1)</span>
                                    ) : (
                                      <span className="text-rose-400">FALSE (0)</span>
                                    )
                                  ) : (
                                    <span className="text-slate-300">{String(val)}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Status Bar */}
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div>
                    Hiển thị {filteredRecords.length} / {tableRecords.length} bản ghi trong bảng [{activeTableMeta.tableName}]
                  </div>
                  <div>Trạng thái kết nối: Connected to [DB_KIENTRE_EDU] (localhost)</div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE T-SQL QUERY CONSOLE */}
            {activeTab === 'query' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
                {/* Sample queries chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-slate-400 shrink-0 font-medium">Mẫu câu lệnh:</span>
                  {activeTableMeta.sampleQueries.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => setCustomQuery(sq.sql)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-md whitespace-nowrap font-mono text-[11px] transition"
                    >
                      {sq.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setCustomQuery(`SELECT * FROM ${activeTableMeta.tableName};`)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md whitespace-nowrap font-mono text-[11px] transition"
                  >
                    SELECT ALL
                  </button>
                </div>

                {/* Query Editor */}
                <div className="flex-1 flex flex-col min-h-[140px] max-h-[220px] bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
                  <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      SQLQuery1.sql — DB_KIENTRE_EDU
                    </span>
                    <button
                      onClick={handleExecuteQuery}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute (F5)</span>
                    </button>
                  </div>
                  <textarea
                    value={customQuery}
                    onChange={e => setCustomQuery(e.target.value)}
                    placeholder="Nhập câu lệnh Transact-SQL (SELECT, WHERE, JOIN, GROUP BY...)"
                    className="flex-1 p-3 bg-slate-950 text-cyan-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Query Result Grid */}
                <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    Results & Messages
                  </div>
                  <div className="flex-1 overflow-auto">
                    {queryResult ? (
                      <div className="p-2">
                        {queryResult.success ? (
                          queryResult.rows.length === 0 ? (
                            <div className="p-4 text-xs text-slate-400 font-mono">
                              (0 rows affected) — Không có kết quả nào.
                            </div>
                          ) : (
                            <table className="w-full text-xs text-left border-collapse font-mono">
                              <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                                <tr>
                                  {queryResult.columns.map((c, i) => (
                                    <th key={i} className="py-2 px-3 border-r border-slate-800 whitespace-nowrap">
                                      {c}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {queryResult.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-900/60">
                                    {row.map((val, cIdx) => (
                                      <td key={cIdx} className="py-1.5 px-3 border-r border-slate-800 whitespace-nowrap text-slate-200">
                                        {typeof val === 'number' && val > 100000 ? formatVND(val) : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )
                        ) : (
                          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono rounded">
                            {queryResult.message}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-slate-500 font-mono">
                          {queryResult.message}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs space-y-1">
                        <div>Bấm nút [Execute (F5)] để thực thi câu lệnh T-SQL trên tập dữ liệu của KIẾN TRẺ.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SCHEMA DEFINITION */}
            {activeTab === 'schema' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mô tả chức năng bảng [{activeTableMeta.tableName}]
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeTableMeta.description}
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Tên Cột (Column)</th>
                        <th className="py-2.5 px-4 font-mono">Kiểu T-SQL</th>
                        <th className="py-2.5 px-4">Khóa</th>
                        <th className="py-2.5 px-4">Cho phép Null</th>
                        <th className="py-2.5 px-4">Mô tả nghiệp vụ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {activeTableMeta.columns.map(col => (
                        <tr key={col.name} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-4 font-bold text-white">
                            {col.name}
                          </td>
                          <td className="py-2.5 px-4 text-cyan-400 font-semibold">
                            {col.type}
                          </td>
                          <td className="py-2.5 px-4">
                            {col.isPk ? (
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[10px]">
                                PRIMARY KEY
                              </span>
                            ) : col.isFk ? (
                              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium text-[10px]">
                                FK -&gt; {col.fkRef}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {col.nullable ? (
                              <span className="text-emerald-400">YES</span>
                            ) : (
                              <span className="text-slate-400 font-bold">NOT NULL</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-300">
                            {col.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: T-SQL SCRIPT VIEWER */}
            {activeTab === 'script' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Kịch bản DDL & DML hoàn chỉnh tương thích với Microsoft SQL Server 2019 / 2022 / Azure SQL
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySql}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Đã sao chép' : 'Sao chép T-SQL'}</span>
                    </button>
                    <button
                      onClick={handleDownloadTableSql}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải file .sql</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto font-mono text-xs text-cyan-300 leading-relaxed shadow-inner">
                  <pre>{generateTableSqlScript()}</pre>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
