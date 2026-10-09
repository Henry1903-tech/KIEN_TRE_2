import {
  NhanVien,
  KhoaHoc,
  LopHoc,
  HocVien,
  PhieuGhiDanh,
  HoaDon,
  LichSuThanhToan,
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

// ==========================================
// 1. NHÂN VIÊN & TÀI KHOẢN (STAFF) - 10 NHÂN SỰ
// ==========================================
export const INITIAL_STAFF: NhanVien[] = [
  {
    MaNV: 'NV001',
    TenNV: 'Trần Anh Tuấn',
    TenDangNhap: 'tuanta',
    MatKhau: '123456',
    Email: 'tuanta@kientre.edu.vn',
    SoDienThoai: '0911111111',
    VaiTro: 'Admin',
    BoPhong: 'Ban Giám Đốc',
    NgayVaoLam: '2020-01-15',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV002',
    TenNV: 'Nguyễn Thị Kim Anh',
    TenDangNhap: 'kimanh',
    MatKhau: '123456',
    Email: 'kimanh@kientre.edu.vn',
    SoDienThoai: '0912222222',
    VaiTro: 'Admin',
    BoPhong: 'Quản Lý Điều Hành',
    NgayVaoLam: '2020-06-10',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV003',
    TenNV: 'Lý Hoàng Minh',
    TenDangNhap: 'minh.ly',
    MatKhau: '123456',
    Email: 'minh@kientre.edu.vn',
    SoDienThoai: '0913333333',
    VaiTro: 'KeToan',
    BoPhong: 'Kế Toán - Tài Chính',
    NgayVaoLam: '2020-08-20',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV004',
    TenNV: 'Đặng Văn Hùng',
    TenDangNhap: 'hung.dang',
    MatKhau: '123456',
    Email: 'hung@kientre.edu.vn',
    SoDienThoai: '0914444444',
    VaiTro: 'GiaoVu',
    BoPhong: 'Giáo Vụ & Tuyển Sinh',
    NgayVaoLam: '2019-03-01',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV005',
    TenNV: 'Vũ Thị Hằng',
    TenDangNhap: 'hang.vu',
    MatKhau: '123456',
    Email: 'hang@kientre.edu.vn',
    SoDienThoai: '0915555555',
    VaiTro: 'GiaoVu',
    BoPhong: 'Giáo Vụ & Tuyển Sinh',
    NgayVaoLam: '2021-02-15',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV006',
    TenNV: 'Lê Thu Hương',
    TenDangNhap: 'huong.le',
    MatKhau: '123456',
    Email: 'huong.le@kientre.edu.vn',
    SoDienThoai: '0916666666',
    VaiTro: 'KeToan',
    BoPhong: 'Kế Toán Thu Ngân',
    NgayVaoLam: '2022-04-01',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV015',
    TenNV: 'ThS. Nguyễn Văn Hải',
    TenDangNhap: 'hai.nguyen',
    MatKhau: '123456',
    Email: 'hai.nguyen@kientre.edu.vn',
    SoDienThoai: '0918888888',
    VaiTro: 'GiangVien',
    BoPhong: 'Khoa Ngoại Ngữ Giao Tiếp',
    NgayVaoLam: '2018-05-10',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV016',
    TenNV: 'ThS. Lê Hoàng Yến',
    TenDangNhap: 'yen.le',
    MatKhau: '123456',
    Email: 'yen.le@kientre.edu.vn',
    SoDienThoai: '0919999999',
    VaiTro: 'GiangVien',
    BoPhong: 'Khoa Luyện Thi IELTS & TOEFL',
    NgayVaoLam: '2019-09-01',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV017',
    TenNV: 'TS. Phạm Minh Tuấn',
    TenDangNhap: 'tuan.pham',
    MatKhau: '123456',
    Email: 'tuan.pham@kientre.edu.vn',
    SoDienThoai: '0921111111',
    VaiTro: 'GiangVien',
    BoPhong: 'Khoa TOEIC & VSTEP',
    NgayVaoLam: '2021-08-15',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
  {
    MaNV: 'NV020',
    TenNV: 'Kỹ sư Phạm Quang Huy',
    TenDangNhap: 'huy.pham',
    MatKhau: '123456',
    Email: 'huy.pham@kientre.edu.vn',
    SoDienThoai: '0920000000',
    VaiTro: 'GiangVien',
    BoPhong: 'Khoa CNTT & Lập Trình',
    NgayVaoLam: '2020-11-20',
    TrangThai: 'Active',
    NgayTao: '2026-01-01',
  },
];

// ==========================================
// 2. CHI NHÁNH (BRANCHES) - 8 CƠ SỞ TOÀN HỆ THỐNG KIẾN TRẺ
// ==========================================
export const INITIAL_BRANCHES: ChiNhanh[] = [
  {
    MaChiNhanh: "CN01",
    TenChiNhanh: "Kiến Trẻ Bình Thạnh (Trụ sở chính)",
    DiaChi: "36/72 Nguyễn Gia Trí, Phường Thạnh Mỹ Tây, TP. HCM",
    SoDienThoai: "028 3812 6868",
    QuanLyID: "NV001",
  },
  {
    MaChiNhanh: "CN02",
    TenChiNhanh: "Kiến Trẻ Tân Bình",
    DiaChi: "86/40 Phổ Quang, Phường Tân Sơn Hòa, TP. HCM",
    SoDienThoai: "028 3899 9988",
    QuanLyID: "NV002",
  },
  {
    MaChiNhanh: "CN03",
    TenChiNhanh: "Kiến Trẻ Thủ Đức",
    DiaChi: "86 Ngô Quyền, Phường Tăng Nhơn Phú, TP. HCM",
    SoDienThoai: "028 3722 4455",
    QuanLyID: "NV005",
  },
  {
    MaChiNhanh: "CN04",
    TenChiNhanh: "Kiến Trẻ Quận 10",
    DiaChi: "436/10 Đường 3/2, Phường Hòa Hưng, TP. HCM",
    SoDienThoai: "028 3822 5566",
    QuanLyID: "NV003",
  },
  {
    MaChiNhanh: "CN05",
    TenChiNhanh: "Kiến Trẻ Tân Phú",
    DiaChi: "29 Ỷ Lan, Phường Phú Thạnh, TP. HCM",
    SoDienThoai: "028 3844 7788",
    QuanLyID: "NV004",
  },
  {
    MaChiNhanh: "CN06",
    TenChiNhanh: "Kiến Trẻ Quận 7",
    DiaChi: "16 Đường Số 36, Phường Tân Hưng, TP. HCM",
    SoDienThoai: "028 5410 7788",
    QuanLyID: "NV006",
  },
  {
    MaChiNhanh: "CN07",
    TenChiNhanh: "Kiến Trẻ Gò Vấp",
    DiaChi: "255a25 Nguyễn Văn Lượng, Phường Gò Vấp, TP. HCM",
    SoDienThoai: "028 3899 1122",
    QuanLyID: "NV015",
  },
  {
    MaChiNhanh: "CN08",
    TenChiNhanh: "Kiến Trẻ Vinhomes Central Park",
    DiaChi: "L3.01-02 Vinhomes Tân Cảng, Phường Thạnh Mỹ Tây, TP. HCM",
    SoDienThoai: "028 3512 8899",
    QuanLyID: "NV016",
  },
];

// ==========================================
// 3. KHÓA HỌC (COURSES) - 14 KHÓA HỌC
// ==========================================
export const INITIAL_COURSES: KhoaHoc[] = [
  {
    MaKH: 'K001',
    TenKH: 'Tiếng Anh Giao Tiếp Sơ Cấp A1.1',
    MoTa: 'Khóa học tiếng Anh giao tiếp phản xạ cho người mất gốc, chuẩn hóa phát âm IPA quốc tế.',
    HocPhi: 2500000,
    ThoiLuong: 30,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K002',
    TenKH: 'Tiếng Anh Giao Tiếp Cơ Bản A1.2',
    MoTa: 'Phát triển phản xạ nghe nói theo chủ đề hằng ngày, thuyết trình ngắn và hội thoại công sở.',
    HocPhi: 2500000,
    ThoiLuong: 30,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K003',
    TenKH: 'Tiếng Anh Giao Tiếp Trung Cấp A2.1',
    MoTa: 'Nâng cao vốn từ vựng thực tế, đàm thoại lưu loát và rèn luyện kỹ năng phỏng vấn tiếng Anh.',
    HocPhi: 3000000,
    ThoiLuong: 35,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K004',
    TenKH: 'Tiếng Anh Giao Tiếp Nâng Cao A2.2',
    MoTa: 'Mở rộng ngữ pháp nâng cao, thuyết trình ý tưởng và giao tiếp đàm phán trong đời sống.',
    HocPhi: 3000000,
    ThoiLuong: 35,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K009',
    TenKH: 'A2 Business English (Thương Mại)',
    MoTa: 'Tiếng Anh thương mại dành cho nhân viên văn phòng: email, họp hành, báo cáo, gặp khách hàng.',
    HocPhi: 3500000,
    ThoiLuong: 40,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K017',
    TenKH: 'B1 IELTS Preparation (IELTS 5.0 - 6.0)',
    MoTa: 'Chuẩn bị thi IELTS 4 kỹ năng: Reading, Listening, Speaking, Writing theo lộ trình tinh gọn.',
    HocPhi: 4500000,
    ThoiLuong: 50,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K018',
    TenKH: 'B1 TOEFL iBT Foundation',
    MoTa: 'Nền tảng TOEFL iBT cho học sinh, sinh viên chuẩn bị hồ sơ du học và xét tuyển đại học.',
    HocPhi: 4500000,
    ThoiLuong: 50,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K023',
    TenKH: 'B2 Business Negotiation & Contract',
    MoTa: 'Tiếng Anh đàm phán hợp đồng thương mại quốc tế, thương thảo đối tác và xử lý khủng hoảng.',
    HocPhi: 5000000,
    ThoiLuong: 50,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K024',
    TenKH: 'B2 IELTS Advanced (IELTS 6.5 - 7.5+)',
    MoTa: 'Luyện thi IELTS chuyên sâu, chiến lược làm bài Band 7.0+ và sửa bài 1:1 cùng Mentor.',
    HocPhi: 5000000,
    ThoiLuong: 55,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K041',
    TenKH: 'TOEIC Intensive 650+ Master',
    MoTa: 'Khóa luyện thi TOEIC cấp tốc giải đề ETS mới nhất, cam kết vượt mốc 650 điểm.',
    HocPhi: 4000000,
    ThoiLuong: 40,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K050',
    TenKH: 'Lập Trình Ứng Dụng C# WinForms & SQL Server',
    MoTa: 'Đào tạo kỹ sư lập trình ứng dụng doanh nghiệp thực chiến bằng C#, ADO.NET và SQL Server.',
    HocPhi: 6500000,
    ThoiLuong: 60,
    NgayTao: '2024-01-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K055',
    TenKH: 'Lập Trình Python & Phân Tích Dữ Liệu Thực Chiến',
    MoTa: 'Trang bị kỹ năng lập trình Python, thư viện Pandas, NumPy, xử lý dữ liệu và tự động hóa công việc.',
    HocPhi: 5500000,
    ThoiLuong: 45,
    NgayTao: '2024-02-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K060',
    TenKH: 'VSTEP B1-B2 Chuẩn Đầu Ra Đại Học & Cao Học',
    MoTa: 'Luyện thi chứng chỉ tiếng Anh VSTEP định dạng Bộ GD&ĐT, bảo đảm chuẩn đầu ra tốt nghiệp.',
    HocPhi: 3800000,
    ThoiLuong: 40,
    NgayTao: '2024-03-01',
    TrangThai: 'Active',
  },
  {
    MaKH: 'K065',
    TenKH: 'Lập Trình Web Fullstack React & Node.js',
    MoTa: 'Xây dựng website chuẩn doanh nghiệp từ giao diện React/Tailwind đến Backend RESTful API Node.js.',
    HocPhi: 6800000,
    ThoiLuong: 60,
    NgayTao: '2024-04-01',
    TrangThai: 'Active',
  },
];

// ==========================================
// 4. LỚP HỌC (CLASSES) - 32 LỚP HỌC (4 LỚP / CƠ SỞ CHO 8 CƠ SỞ)
// ==========================================
export const INITIAL_CLASSES: LopHoc[] = [
  // --- Cơ sở 1 - Tân Bình (CN01) ---
  {
    MaLop: "K001-L01",
    TenLop: "Lớp 1A - Giao Tiếp Khởi Đầu (Bình Thạnh)",
    MaKH: "K001",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 30,
    SoLuongDaDangKy: 24,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN01",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K001-L02",
    TenLop: "Lớp 1B - Giao Tiếp Cơ Bản (Bình Thạnh)",
    MaKH: "K001",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 30,
    SoLuongDaDangKy: 22,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN01",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K002-L01",
    TenLop: "Lớp 2A - Elementary Phát Âm Chuẩn (Bình Thạnh)",
    MaKH: "K002",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 30,
    SoLuongDaDangKy: 25,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN01",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K065-L01",
    TenLop: "Lớp WEB01 - Frontend React & TypeScript (Bình Thạnh)",
    MaKH: "K065",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 21,
    NhanVienDayID: "NV020",
    MaChiNhanh: "CN01",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 2 - Gò Vấp (CN02) ---
  {
    MaLop: "K001-L03",
    TenLop: "Lớp 1C - Giao Tiếp Ca Tối (Tân Bình)",
    MaKH: "K001",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 20,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN02",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K002-L02",
    TenLop: "Lớp 2B - Hội Thoại Công Sở (Tân Bình)",
    MaKH: "K002",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 18,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN02",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K017-L02",
    TenLop: "Lớp IELTS02 - Academic Speaking & Writing (Tân Bình)",
    MaKH: "K017",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 17,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN02",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K041-L01",
    TenLop: "Lớp TOEIC01 - Intensive 750+ (Tân Bình)",
    MaKH: "K041",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 30,
    SoLuongDaDangKy: 22,
    NhanVienDayID: "NV017",
    MaChiNhanh: "CN02",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 3 - Quận 1 (CN03) ---
  {
    MaLop: "K010-L01",
    TenLop: "Lớp 3A - Business English Presentation (Thủ Đức)",
    MaKH: "K010",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 19,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN03",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K023-L01",
    TenLop: "Lớp B2.1 - Business Negotiation & Email Writing (Thủ Đức)",
    MaKH: "K023",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 16,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN03",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K033-L01",
    TenLop: "Lớp C1.1 - Legal & Financial English (Thủ Đức)",
    MaKH: "K033",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 15,
    SoLuongDaDangKy: 14,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN03",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K050-L03",
    TenLop: "Lớp VIP01 - Tiếng Anh Executive 1-Kèm-1 (Thủ Đức)",
    MaKH: "K050",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 10,
    SoLuongDaDangKy: 9,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN03",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 4 - Quận 7 (CN04) ---
  {
    MaLop: "K003-L01",
    TenLop: "Lớp Pre-IELTS - Nền Tảng Học Thuật (Quận 10)",
    MaKH: "K003",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 22,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN04",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K017-L01",
    TenLop: "Lớp IELTS01 - Mục Tiêu 6.5+ Band Score (Quận 10)",
    MaKH: "K017",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 19,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN04",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K035-L01",
    TenLop: "Lớp C2.1 - IELTS Master 7.5+ & Du học (Quận 10)",
    MaKH: "K035",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 18,
    SoLuongDaDangKy: 16,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN04",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K042-L01",
    TenLop: "Lớp TOEFL01 - TOEFL iBT Intensive (Quận 10)",
    MaKH: "K042",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 22,
    SoLuongDaDangKy: 18,
    NhanVienDayID: "NV017",
    MaChiNhanh: "CN04",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 5 - TP. Thủ Đức (CN05) ---
  {
    MaLop: "K050-L01",
    TenLop: "Lớp CS01 - Lập trình Python & AI Cơ bản (Tân Phú)",
    MaKH: "K050",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 30,
    SoLuongDaDangKy: 28,
    NhanVienDayID: "NV020",
    MaChiNhanh: "CN05",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K050-L02",
    TenLop: "Lớp CS02 - Cấu trúc dữ liệu & Thuật toán (Tân Phú)",
    MaKH: "K050",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 21,
    NhanVienDayID: "NV020",
    MaChiNhanh: "CN05",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K055-L01",
    TenLop: "Lớp DATA01 - Data Analyst & SQL Server (Tân Phú)",
    MaKH: "K055",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 24,
    NhanVienDayID: "NV020",
    MaChiNhanh: "CN05",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K065-L02",
    TenLop: "Lớp WEB02 - Fullstack MERN Doanh Nghiệp (Tân Phú)",
    MaKH: "K065",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 23,
    NhanVienDayID: "NV020",
    MaChiNhanh: "CN05",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 6 - Bình Thạnh (CN06) ---
  {
    MaLop: "K009-L01",
    TenLop: "Lớp 2C - Giao Tiếp Phản Xạ Cấp Tốc (Quận 7)",
    MaKH: "K009",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 22,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN06",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K017-L03",
    TenLop: "Lớp IELTS03 - Luyện đề Cam Real Test (Quận 7)",
    MaKH: "K017",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 18,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN06",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K024-L01",
    TenLop: "Lớp IELTS VIP - Speaking 1-Kèm-1 Native (Quận 7)",
    MaKH: "K024",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 12,
    SoLuongDaDangKy: 11,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN06",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K041-L02",
    TenLop: "Lớp TOEIC02 - Giải Đề ETS Cấp Tốc (Quận 7)",
    MaKH: "K041",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 28,
    SoLuongDaDangKy: 24,
    NhanVienDayID: "NV017",
    MaChiNhanh: "CN06",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 7 - Cầu Giấy, Hà Nội (CN07) ---
  {
    MaLop: "K001-L04",
    TenLop: "Lớp GV01 - Giao Tiếp Học Thuật (Gò Vấp)",
    MaKH: "K001",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 30,
    SoLuongDaDangKy: 26,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN07",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K010-L02",
    TenLop: "Lớp GV02 - Tiếng Anh Thương Mại Quốc Tế (Gò Vấp)",
    MaKH: "K010",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 22,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN07",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K024-L02",
    TenLop: "Lớp GV03 - IELTS 7.0+ Học Thuật Cao Cấp (Gò Vấp)",
    MaKH: "K024",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 18,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN07",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K035-L02",
    TenLop: "Lớp GV04 - VSTEP B2 & C1 Chuẩn Đầu Ra (Gò Vấp)",
    MaKH: "K035",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 21,
    NhanVienDayID: "NV017",
    MaChiNhanh: "CN07",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },

  // --- Cơ sở 8 - Hải Châu, Đà Nẵng (CN08) ---
  {
    MaLop: "K002-L03",
    TenLop: "Lớp VH01 - Giao Tiếp Executive (Vinhomes Central Park)",
    MaKH: "K002",
    NgayKhaiGiang: "2024-04-10",
    NgayKetThuc: "2024-07-10",
    SucChuaToiDa: 28,
    SoLuongDaDangKy: 24,
    NhanVienDayID: "NV015",
    MaChiNhanh: "CN08",
    TrangThai: "DaKetThuc",
    NgayTao: "2024-03-01",
  },
  {
    MaLop: "K017-L04",
    TenLop: "Lớp VH02 - IELTS VIP 7.5+ (Vinhomes Central Park)",
    MaKH: "K017",
    NgayKhaiGiang: "2025-05-15",
    NgayKetThuc: "2025-08-15",
    SucChuaToiDa: 20,
    SoLuongDaDangKy: 17,
    NhanVienDayID: "NV016",
    MaChiNhanh: "CN08",
    TrangThai: "DaKetThuc",
    NgayTao: "2025-03-01",
  },
  {
    MaLop: "K055-L02",
    TenLop: "Lớp VH03 - Business Analytics & AI (Vinhomes Central Park)",
    MaKH: "K055",
    NgayKhaiGiang: "2026-06-01",
    NgayKetThuc: "2026-09-01",
    SucChuaToiDa: 25,
    SoLuongDaDangKy: 20,
    NhanVienDayID: "NV020",
    MaChiNhanh: "CN08",
    TrangThai: "DaKhaiGiang",
    NgayTao: "2026-03-01",
  },
  {
    MaLop: "K060-L01",
    TenLop: "Lớp VH04 - Tiếng Anh Thương Mại Đàm Phán (Vinhomes Central Park)",
    MaKH: "K060",
    NgayKhaiGiang: "2026-10-15",
    NgayKetThuc: "2026-12-30",
    SucChuaToiDa: 22,
    SoLuongDaDangKy: 19,
    NhanVienDayID: "NV017",
    MaChiNhanh: "CN08",
    TrangThai: "DangChieuSinh",
    NgayTao: "2026-03-01",
  },
];

// ==========================================
// 5. THỜI KHÓA BIỂU (SCHEDULES) - 32 CA HỌC (8 CƠ SỞ)
// ==========================================
export const INITIAL_SCHEDULES: LichHoc[] = [
  // CN01 - Tân Bình
  { MaLichHoc: "LH001", MaLop: "K001-L01", ThuTrongTuan: "Thứ 2", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Lab 101 (Tân Bình)", GiangVienID: "NV015", MaChiNhanh: "CN01" },
  { MaLichHoc: "LH002", MaLop: "K001-L01", ThuTrongTuan: "Thứ 4", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Lab 101 (Tân Bình)", GiangVienID: "NV015", MaChiNhanh: "CN01" },
  { MaLichHoc: "LH003", MaLop: "K001-L02", ThuTrongTuan: "Thứ 3", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Lab 102 (Tân Bình)", GiangVienID: "NV015", MaChiNhanh: "CN01" },
  { MaLichHoc: "LH004", MaLop: "K065-L01", ThuTrongTuan: "Thứ 7", GioBatDau: "08:30", GioKetThuc: "11:30", PhongHoc: "Phòng Máy Lập Trình 302 (Tân Bình)", GiangVienID: "NV020", MaChiNhanh: "CN01" },

  // CN02 - Gò Vấp
  { MaLichHoc: "LH005", MaLop: "K001-L03", ThuTrongTuan: "Thứ 2", GioBatDau: "19:30", GioKetThuc: "21:00", PhongHoc: "Phòng 201 (Gò Vấp)", GiangVienID: "NV015", MaChiNhanh: "CN02" },
  { MaLichHoc: "LH006", MaLop: "K001-L03", ThuTrongTuan: "Thứ 4", GioBatDau: "19:30", GioKetThuc: "21:00", PhongHoc: "Phòng 201 (Gò Vấp)", GiangVienID: "NV015", MaChiNhanh: "CN02" },
  { MaLichHoc: "LH007", MaLop: "K017-L02", ThuTrongTuan: "Thứ 3", GioBatDau: "19:30", GioKetThuc: "21:00", PhongHoc: "Phòng IELTS VIP 102 (Gò Vấp)", GiangVienID: "NV016", MaChiNhanh: "CN02" },
  { MaLichHoc: "LH008", MaLop: "K041-L01", ThuTrongTuan: "Thứ 5", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Hội Thảo 203 (Gò Vấp)", GiangVienID: "NV017", MaChiNhanh: "CN02" },

  // CN03 - Quận 1 VIP
  { MaLichHoc: "LH009", MaLop: "K010-L01", ThuTrongTuan: "Thứ 2", GioBatDau: "18:30", GioKetThuc: "20:30", PhongHoc: "Phòng VIP Executive 101 (Quận 1)", GiangVienID: "NV016", MaChiNhanh: "CN03" },
  { MaLichHoc: "LH010", MaLop: "K023-L01", ThuTrongTuan: "Thứ 4", GioBatDau: "19:30", GioKetThuc: "21:30", PhongHoc: "Phòng Đàm Phán Q1 (Quận 1)", GiangVienID: "NV016", MaChiNhanh: "CN03" },
  { MaLichHoc: "LH011", MaLop: "K033-L01", ThuTrongTuan: "Thứ 6", GioBatDau: "18:30", GioKetThuc: "20:30", PhongHoc: "Phòng VIP Executive 102 (Quận 1)", GiangVienID: "NV016", MaChiNhanh: "CN03" },
  { MaLichHoc: "LH012", MaLop: "K050-L03", ThuTrongTuan: "Thứ 7", GioBatDau: "09:00", GioKetThuc: "11:00", PhongHoc: "Phòng Mentor 1-1 (Quận 1)", GiangVienID: "NV015", MaChiNhanh: "CN03" },

  // CN04 - Quận 7 Phú Mỹ Hưng
  { MaLichHoc: "LH013", MaLop: "K003-L01", ThuTrongTuan: "Thứ 3", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Cambridge Q7 (Quận 7)", GiangVienID: "NV015", MaChiNhanh: "CN04" },
  { MaLichHoc: "LH014", MaLop: "K017-L01", ThuTrongTuan: "Thứ 5", GioBatDau: "19:30", GioKetThuc: "21:00", PhongHoc: "Phòng IELTS VIP 201 (Quận 7)", GiangVienID: "NV016", MaChiNhanh: "CN04" },
  { MaLichHoc: "LH015", MaLop: "K035-L01", ThuTrongTuan: "Thứ 7", GioBatDau: "14:00", GioKetThuc: "17:00", PhongHoc: "Phòng Hội Thảo Nam Sài Gòn (Quận 7)", GiangVienID: "NV016", MaChiNhanh: "CN04" },
  { MaLichHoc: "LH016", MaLop: "K042-L01", ThuTrongTuan: "Chủ nhật", GioBatDau: "08:30", GioKetThuc: "11:30", PhongHoc: "Phòng TOEFL Lab 202 (Quận 7)", GiangVienID: "NV017", MaChiNhanh: "CN04" },

  // CN05 - TP. Thủ Đức
  { MaLichHoc: "LH017", MaLop: "K050-L01", ThuTrongTuan: "Thứ 7", GioBatDau: "08:30", GioKetThuc: "11:30", PhongHoc: "Phòng AI & Coding Studio 501 (Thủ Đức)", GiangVienID: "NV020", MaChiNhanh: "CN05" },
  { MaLichHoc: "LH018", MaLop: "K050-L02", ThuTrongTuan: "Chủ nhật", GioBatDau: "14:00", GioKetThuc: "17:00", PhongHoc: "Phòng Coding Studio 502 (Thủ Đức)", GiangVienID: "NV020", MaChiNhanh: "CN05" },
  { MaLichHoc: "LH019", MaLop: "K055-L01", ThuTrongTuan: "Thứ 3", GioBatDau: "19:00", GioKetThuc: "21:00", PhongHoc: "Phòng Data Lab 503 (Thủ Đức)", GiangVienID: "NV020", MaChiNhanh: "CN05" },
  { MaLichHoc: "LH020", MaLop: "K065-L02", ThuTrongTuan: "Thứ 5", GioBatDau: "19:00", GioKetThuc: "21:00", PhongHoc: "Phòng Fullstack Lab 504 (Thủ Đức)", GiangVienID: "NV020", MaChiNhanh: "CN05" },

  // CN06 - Bình Thạnh
  { MaLichHoc: "LH021", MaLop: "K009-L01", ThuTrongTuan: "Thứ 2", GioBatDau: "18:00", GioKetThuc: "20:00", PhongHoc: "Phòng Phản Xạ 101 (Bình Thạnh)", GiangVienID: "NV016", MaChiNhanh: "CN06" },
  { MaLichHoc: "LH022", MaLop: "K017-L03", ThuTrongTuan: "Thứ 4", GioBatDau: "18:30", GioKetThuc: "20:30", PhongHoc: "Phòng IELTS Real Test 201 (Bình Thạnh)", GiangVienID: "NV016", MaChiNhanh: "CN06" },
  { MaLichHoc: "LH023", MaLop: "K024-L01", ThuTrongTuan: "Thứ 6", GioBatDau: "19:00", GioKetThuc: "21:00", PhongHoc: "Phòng 1-on-1 Studio 202 (Bình Thạnh)", GiangVienID: "NV016", MaChiNhanh: "CN06" },
  { MaLichHoc: "LH024", MaLop: "K041-L02", ThuTrongTuan: "Chủ nhật", GioBatDau: "08:30", GioKetThuc: "11:00", PhongHoc: "Phòng ETS Test Center 301 (Bình Thạnh)", GiangVienID: "NV017", MaChiNhanh: "CN06" },

  // CN07 - Cầu Giấy, Hà Nội
  { MaLichHoc: "LH025", MaLop: "K001-L04", ThuTrongTuan: "Thứ 2", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Thăng Long 401 (Cầu Giấy, HN)", GiangVienID: "NV015", MaChiNhanh: "CN07" },
  { MaLichHoc: "LH026", MaLop: "K010-L02", ThuTrongTuan: "Thứ 4", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Hội Thảo Hà Nội 402 (HN)", GiangVienID: "NV016", MaChiNhanh: "CN07" },
  { MaLichHoc: "LH027", MaLop: "K024-L02", ThuTrongTuan: "Thứ 6", GioBatDau: "19:30", GioKetThuc: "21:30", PhongHoc: "Phòng IELTS Academic 403 (HN)", GiangVienID: "NV016", MaChiNhanh: "CN07" },
  { MaLichHoc: "LH028", MaLop: "K035-L02", ThuTrongTuan: "Thứ 7", GioBatDau: "14:00", GioKetThuc: "17:00", PhongHoc: "Phòng VSTEP Center 404 (HN)", GiangVienID: "NV017", MaChiNhanh: "CN07" },

  // CN08 - Hải Châu, Đà Nẵng
  { MaLichHoc: "LH029", MaLop: "K002-L03", ThuTrongTuan: "Thứ 3", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Sông Hàn 201 (Hải Châu, ĐN)", GiangVienID: "NV015", MaChiNhanh: "CN08" },
  { MaLichHoc: "LH030", MaLop: "K017-L04", ThuTrongTuan: "Thứ 5", GioBatDau: "18:00", GioKetThuc: "19:30", PhongHoc: "Phòng Đổi Mới Sáng Tạo 202 (ĐN)", GiangVienID: "NV016", MaChiNhanh: "CN08" },
  { MaLichHoc: "LH031", MaLop: "K055-L02", ThuTrongTuan: "Thứ 7", GioBatDau: "08:30", GioKetThuc: "11:30", PhongHoc: "Phòng Data Lab Đà Nẵng 301 (ĐN)", GiangVienID: "NV020", MaChiNhanh: "CN08" },
  { MaLichHoc: "LH032", MaLop: "K060-L01", ThuTrongTuan: "Chủ nhật", GioBatDau: "14:00", GioKetThuc: "17:00", PhongHoc: "Phòng Tech Innovation 302 (ĐN)", GiangVienID: "NV017", MaChiNhanh: "CN08" },
];


// ==========================================
// 6. HỌC VIÊN (STUDENTS) - 180 HỌC VIÊN QUA 3 NĂM (2024 - 2026)
// ==========================================
const HO_DEM = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đoàn", "Trịnh", "Mai", "Lương"];
const TEN_NAM = ["Hải Đăng", "Minh Trí", "Quốc Bảo", "Thành Nam", "Đức Anh", "Văn Thư", "Hữu Dũng", "Công Sơn", "Đình Diệu", "Quốc Tâm", "Tấn Phát", "Trọng Nhân", "Minh Khang", "Tuấn Kiệt", "Hữu Phước", "Gia Huy", "Hoàng Long", "Quang Vinh", "Đình Trọng", "Bảo Long", "Thế Anh", "Nhật Minh", "Hoàng Quân", "Thành Trung", "Khánh Duy", "Tiến Dũng", "Trọng Hiếu", "Duy Mạnh", "Việt Anh", "Văn Toàn", "Đức Huy", "Quang Huy"];
const TEN_NU = ["Phương Thảo", "Thu Châu", "Gia Linh", "Thùy Dung", "Gia Hân", "Ngọc Trâm", "Mỹ Duyên", "Thanh Trúc", "Bảo Ngọc", "Kim Ngân", "Bích Trâm", "Thục Quyên", "Khánh Linh", "Yến Nhi", "Quỳnh Như", "Ánh Tuyết", "Minh Thư", "Mai Anh", "Cẩm Tú", "Tuyết Mai", "Thúy Vy", "Thu Trang", "Diễm My", "Lan Hương", "Ngọc Hân", "Hoài Thương", "Hà My", "Phương Linh", "Huyền Trang", "Thanh Hằng", "Bảo Châu", "Thảo Nguyên"];
const QUAN_HUYEN = ["Bình Thạnh", "Tân Bình", "Thủ Đức", "Quận 10", "Tân Phú", "Quận 7", "Gò Vấp", "Quận 1", "Quận 3", "Phú Nhuận"];
const TEN_DUONG = ["Nguyễn Gia Trí", "Phổ Quang", "Ngô Quyền", "Đường 3/2", "Ỷ Lan", "Đường Số 36", "Nguyễn Văn Lượng", "Điện Biên Phủ", "Cộng Hòa", "Hoàng Hoa Thám", "Lê Văn Sỹ", "Quang Trung"];

function get3YearDate(index: number, maxMonth2026 = 10): string {
  const yearGroup = index % 3;
  const year = yearGroup === 0 ? 2024 : yearGroup === 1 ? 2025 : 2026;
  const maxMonth = year === 2026 ? maxMonth2026 : 12;
  const month = 1 + ((index * 3) % maxMonth);
  const day = 1 + ((index * 7) % 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateInitialStudents(): HocVien[] {
  const students: HocVien[] = [];

  for (let i = 1; i <= 180; i++) {
    const maHV = `HV${String(i).padStart(3, "0")}`;
    const isMale = i % 2 === 0;
    const ho = HO_DEM[i % HO_DEM.length];
    const ten = isMale ? TEN_NAM[(i * 3) % TEN_NAM.length] : TEN_NU[(i * 3) % TEN_NU.length];
    const tenHV = `${ho} ${ten}`;
    const phone = `09${String(10000000 + i * 35719).slice(0, 8)}`;
    const birthYear = 1992 + (i % 13);
    const birthMonth = String(1 + (i % 12)).padStart(2, "0");
    const birthDay = String(1 + (i % 28)).padStart(2, "0");
    const quan = QUAN_HUYEN[i % QUAN_HUYEN.length];
    const duong = TEN_DUONG[i % TEN_DUONG.length];
    const soNha = ((i * 17) % 500) + 1;
    const regDate = get3YearDate(i);

    students.push({
      MaHV: maHV,
      TenHV: tenHV,
      SoDienThoai: phone,
      Email: `hocvien.${String(i).padStart(3, "0")}@kientre.edu.vn`,
      NgaySinh: `${birthYear}-${birthMonth}-${birthDay}`,
      GioiTinh: isMale ? "Nam" : "Nữ",
      DiaChi: `${soNha} ${duong}, Phường ${(i % 15) + 1}`,
      QuanHuyen: quan,
      ThanhPho: "TP.HCM",
      CMNDNumber: `079${String(birthYear).slice(2)}${String(100000 + i * 137).slice(0, 7)}`,
      NgayDangKyDau: regDate,
      TrangThai: i === 42 || i === 88 || i === 135 ? "Suspended" : "Active",
      GhiChu: i % 7 === 0 ? "Đăng ký theo chương trình học bổng doanh nghiệp" : undefined,
    });
  }

  return students;
}

export const INITIAL_STUDENTS: HocVien[] = generateInitialStudents();

// ==========================================
// 7. GHI DANH (ENROLLMENTS) - 180 PHIẾU GHI DANH QUA 3 NĂM
// ==========================================
function generateInitialEnrollments(): PhieuGhiDanh[] {
  const enrollments: PhieuGhiDanh[] = [];
  const classes = INITIAL_CLASSES;
  const courses = INITIAL_COURSES;

  for (let i = 1; i <= 180; i++) {
    const maPhieu = `PGD-${String(i).padStart(3, "0")}`;
    const student = INITIAL_STUDENTS[(i - 1) % INITIAL_STUDENTS.length];
    const cls = classes[(i - 1) % classes.length];
    const course = courses.find(c => c.MaKH === cls.MaKH);
    const fee = course?.HocPhi || 3000000;
    const isReserve = i % 8 === 0;
    const enrollDate = get3YearDate(i);

    enrollments.push({
      MaPhieuGhiDanh: maPhieu,
      MaHV: student.MaHV,
      MaLop: cls.MaLop,
      NgayGhiDanh: `${enrollDate} 09:30`,
      LoaiGhiDanh: isReserve ? "GiuCho" : "ChinhThuc",
      HocPhi: fee,
      TrangThai: isReserve ? "GiuCho" : "ChinhThuc",
      GhiChu: isReserve ? "Đăng ký giữ chỗ học phí trước khai giảng" : "Ghi danh lớp học chính khóa",
      NhanVienTao: (i % 2 === 0) ? "NV004" : "NV005",
      NgayCapNhat: `${enrollDate} 10:00`,
    });
  }

  return enrollments;
}

export const INITIAL_ENROLLMENTS: PhieuGhiDanh[] = generateInitialEnrollments();

// ==========================================
// 8. HÓA ĐƠN HỌC PHÍ (INVOICES) - 210 HÓA ĐƠN QUA 3 NĂM
// (Có >= 105 Hóa đơn CÒN NỢ để Module Công Nợ có >= 100 dòng!)
// ==========================================
function generateInitialInvoices(): HoaDon[] {
  const invoices: HoaDon[] = [];

  for (let i = 1; i <= 210; i++) {
    const enrollment = INITIAL_ENROLLMENTS[(i - 1) % INITIAL_ENROLLMENTS.length];
    const maHD = `HD-${String(i).padStart(3, "0")}`;
    const fee = enrollment.HocPhi;
    const hasDiscount = i % 6 === 0;
    const discount = hasDiscount ? 300000 : 0;
    const netFee = fee - discount;

    let daThu = 0;
    let conNo = 0;
    let trangThai: "DaThanhToan" | "PartialPay" | "ChuaThanhToan" = "DaThanhToan";

    // 108 hóa đơn còn nợ (TienConNo > 0)
    if (i % 2 === 0) {
      if (i % 4 === 0) {
        daThu = Math.round(netFee * 0.5);
        conNo = netFee - daThu;
        trangThai = "PartialPay";
      } else {
        daThu = 0;
        conNo = netFee;
        trangThai = "ChuaThanhToan";
      }
    } else {
      daThu = netFee;
      conNo = 0;
      trangThai = "DaThanhToan";
    }

    const invDate = get3YearDate(i);
    const dateObj = new Date(invDate);
    dateObj.setDate(dateObj.getDate() + 15);
    const dueDate = dateObj.toISOString().slice(0, 10);

    invoices.push({
      MaHoaDon: maHD,
      MaPhieuGhiDanh: enrollment.MaPhieuGhiDanh,
      MaHV: enrollment.MaHV,
      TongTien: fee,
      TienGiamGia: discount,
      TienThucThu: daThu,
      TienConNo: conNo,
      NgayHoaDon: invDate,
      NgayHanTraNo: conNo > 0 ? dueDate : undefined,
      TrangThai: trangThai,
      NhanVienThu: (i % 2 === 0) ? "NV003" : "NV006",
      HinhThucThanhToan: (i % 3 === 0) ? "TienMat" : "ChuyenKhoan",
      GhiChu: conNo > 0 ? `Công nợ khóa học (Kỳ ${invDate.slice(0, 7)})` : "Đã thanh toán đủ học phí",
    });
  }

  return invoices;
}

export const INITIAL_INVOICES: HoaDon[] = generateInitialInvoices();

// ==========================================
// 9. LỊCH SỬ THANH TOÁN (PAYMENTS) - 150 GIAO DỊCH QUA 3 NĂM
// ==========================================
function generateInitialPayments(): LichSuThanhToan[] {
  const payments: LichSuThanhToan[] = [];
  const paidInvoices = INITIAL_INVOICES.filter(i => i.TienThucThu > 0);

  for (let i = 0; i < Math.min(150, paidInvoices.length); i++) {
    const inv = paidInvoices[i];
    const maTT = `TT-${String(i + 1).padStart(3, "0")}`;

    payments.push({
      MaThanhToan: maTT,
      MaHoaDon: inv.MaHoaDon,
      MaHV: inv.MaHV,
      SoTienThanhToan: inv.TienThucThu,
      NgayThanhToan: `${inv.NgayHoaDon} 14:15`,
      HinhThucThanhToan: inv.HinhThucThanhToan,
      NhanVienThu: inv.NhanVienThu,
      MaGiaoDich: inv.HinhThucThanhToan === "ChuyenKhoan" ? `VNM${inv.NgayHoaDon.replace(/-/g, "")}${String(100 + i)}` : undefined,
      GhiChu: "Xác nhận thu phí đào tạo thành công",
    });
  }

  return payments;
}

export const INITIAL_PAYMENTS: LichSuThanhToan[] = generateInitialPayments();


// ==========================================
// 10. KHÁCH HÀNG TIỀM NĂNG CRM (LEADS) - 135 LEADS
// (Chỉ sử dụng 3 mức độ: Cần học gấp, Đang cân nhắc, Hỏi tham khảo thông tin)
// ==========================================
function generateInitialLeads(): KhachHangTiemNang[] {
  const leads: KhachHangTiemNang[] = [];
  const sources: KhachHangTiemNang['Nguon'][] = ['Facebook', 'Website', 'GioiThieu', 'TrucTiep', 'Workshop'];
  const potentials: KhachHangTiemNang['MucDoTiemNang'][] = ['Cần học gấp', 'Đang cân nhắc', 'Hỏi tham khảo thông tin'];
  const statuses: KhachHangTiemNang['TrangThai'][] = ['DangTuVan', 'DaHenLich', 'Moi', 'DaChuyenDoi', 'Huy'];
  const courses = INITIAL_COURSES;

  for (let i = 1; i <= 135; i++) {
    const maLead = `LEAD-${String(i).padStart(3, '0')}`;
    const isMale = i % 2 === 1;
    const ho = HO_DEM[(i * 3) % HO_DEM.length];
    const ten = isMale ? TEN_NAM[(i * 5) % TEN_NAM.length] : TEN_NU[(i * 5) % TEN_NU.length];
    const hoTen = `${ho} ${ten}`;
    const phone = `09${String(20000000 + i * 47823).slice(0, 8)}`;
    const course = courses[i % courses.length];
    const source = sources[i % sources.length];
    const potential = potentials[i % potentials.length];
    const status = statuses[i % statuses.length];

    leads.push({
      MaLead: maLead,
      HoTen: hoTen,
      SoDienThoai: phone,
      Email: `lead.${String(i).padStart(3, '0')}@gmail.com`,
      KhoaHocQuanTam: course.TenKH,
      Nguon: source,
      MucDoTiemNang: potential,
      TrangThai: status,
      NhanVienPhuTrach: (i % 2 === 0) ? 'NV004' : 'NV005',
      NgayTiepNhan: get3YearDate(i),
      LichHenTuVan: status === 'DaHenLich' ? `${get3YearDate(i)} 18:30` : undefined,
      GhiChu: potential === 'Cần học gấp' ? 'Cần chứng chỉ để nộp hồ sơ tốt nghiệp / việc làm' : potential === 'Đang cân nhắc' ? 'Đang cân nhắc học phí và lịch học ca tối' : 'Tìm hiểu thông tin và giáo trình đào tạo',
    });
  }

  return leads;
}

export const INITIAL_CRM_LEADS: KhachHangTiemNang[] = generateInitialLeads();

// ==========================================
// 11. ĐIỂM DANH (ATTENDANCE) - 160 BUỔI HỌC
// ==========================================
function generateInitialAttendance(): DiemDanh[] {
  const list: DiemDanh[] = [];
  const statuses: DiemDanh['TrangThai'][] = ['CoMat', 'CoMat', 'CoMat', 'DiMuon', 'CoPhep', 'Vang'];

  for (let i = 1; i <= 160; i++) {
    const maDD = `DD${String(i).padStart(3, '0')}`;
    const student = INITIAL_STUDENTS[(i - 1) % INITIAL_STUDENTS.length];
    const cls = INITIAL_CLASSES[(i - 1) % INITIAL_CLASSES.length];
    const st = statuses[i % statuses.length];

    list.push({
      MaDiemDanh: maDD,
      MaLop: cls.MaLop,
      MaHV: student.MaHV,
      NgayHoc: get3YearDate(i),
      TrangThai: st,
      GhiChu: st === 'DiMuon' ? 'Đi muộn 15 phút' : st === 'CoPhep' ? 'Có báo phép giáo vụ trước giờ học' : undefined,
    });
  }

  return list;
}

export const INITIAL_ATTENDANCE: DiemDanh[] = generateInitialAttendance();

// ==========================================
// 12. BẢNG ĐIỂM & ĐÁNH GIÁ (GRADES) - 125 BẢNG ĐIỂM
// ==========================================
function generateInitialGrades(): DiemSo[] {
  const grades: DiemSo[] = [];

  for (let i = 1; i <= 125; i++) {
    const maDiem = `DS${String(i).padStart(3, '0')}`;
    const student = INITIAL_STUDENTS[i - 1];
    const cls = INITIAL_CLASSES[(i - 1) % INITIAL_CLASSES.length];

    const cc = Math.min(10, 8.0 + (i % 5) * 0.5);
    const gk = Math.min(10, 6.5 + (i % 7) * 0.5);
    const ck = Math.min(10, 6.0 + (i % 8) * 0.5);
    const tk = Number((cc * 0.1 + gk * 0.3 + ck * 0.6).toFixed(1));

    let xepLoai: DiemSo['XepLoai'] = 'Khá';
    if (tk >= 9.0) xepLoai = 'Xuất sắc';
    else if (tk >= 8.0) xepLoai = 'Giỏi';
    else if (tk >= 6.5) xepLoai = 'Khá';
    else if (tk >= 5.0) xepLoai = 'Trung bình';
    else xepLoai = 'Yếu';

    grades.push({
      MaDiem: maDiem,
      MaHV: student.MaHV,
      MaLop: cls.MaLop,
      DiemChuyenCan: cc,
      DiemGiuaKy: gk,
      DiemCuoiKy: ck,
      DiemTongKet: tk,
      XepLoai: xepLoai,
      TrangThaiQuaMon: tk >= 5.0,
      NgayDanhGia: get3YearDate(i),
      NhanXet: tk >= 8.0 ? 'Thái độ học tập gương mẫu, nắm chắc kiến thức thực hành.' : 'Cần trau dồi thêm kỹ năng làm bài thi.',
    });
  }

  return grades;
}

export const INITIAL_GRADES: DiemSo[] = generateInitialGrades();

// ==========================================
// 13. CHỨNG CHỈ TỐT NGHIỆP (CERTIFICATES) - 105 CHỨNG CHỈ
// ==========================================
function generateInitialCertificates(): ChungChi[] {
  const certs: ChungChi[] = [];

  for (let i = 1; i <= 105; i++) {
    const maCC = `CC-2026-${String(i).padStart(3, '0')}`;
    const student = INITIAL_STUDENTS[i - 1];
    const cls = INITIAL_CLASSES[(i - 1) % INITIAL_CLASSES.length];
    const course = INITIAL_COURSES.find(c => c.MaKH === cls.MaKH);
    const rank = i % 3 === 0 ? 'Xuất sắc' : i % 2 === 0 ? 'Giỏi' : 'Khá';

    certs.push({
      MaChungChi: maCC,
      MaHV: student.MaHV,
      MaLop: cls.MaLop,
      TenChungChi: `CHỨNG CHỈ TỐT NGHIỆP ${course?.TenKH.toUpperCase() || 'KHÓA ĐÀO TẠO'}`,
      NgayCap: get3YearDate(i),
      XepLoai: rank,
      SoHieu: `KTE-${course?.MaKH || 'EDU'}-2026-${String(100 + i).padStart(3, '0')}`,
    });
  }

  return certs;
}

export const INITIAL_CERTIFICATES: ChungChi[] = generateInitialCertificates();

// ==========================================
// 14. SỔ QUỸ THU - CHI (CASH FLOW) - 125 PHIẾU
// (80 Phiếu thu học phí + 45 Phiếu chi hoạt động)
// ==========================================
function generateInitialCashFlow(): PhieuThuChi[] {
  const list: PhieuThuChi[] = [];

  // Phiếu thu học phí từ các hóa đơn (2024, 2025, 2026)
  const paidInvoices = INITIAL_INVOICES.filter(inv => inv.TienThucThu > 0);
  for (let i = 0; i < Math.min(100, paidInvoices.length); i++) {
    const inv = paidInvoices[i];
    const maPT = `PT-${inv.NgayHoaDon.slice(0, 7).replace("-", "")}-${String(i + 1).padStart(3, "0")}`;
    list.push({
      MaPhieuTC: maPT,
      Loai: "Thu",
      HangMuc: "ThuHocPhi",
      TenHangMuc: `Thu học phí - ${inv.MaPhieuGhiDanh}`,
      SoTien: inv.TienThucThu,
      HinhThuc: inv.HinhThucThanhToan === "TienMat" ? "TienMat" : "ChuyenKhoan",
      NgayGiaoDich: inv.NgayHoaDon,
      NguoiGiaoDich: INITIAL_STUDENTS.find(s => s.MaHV === inv.MaHV)?.TenHV || "Học viên",
      NhanVienThucHien: inv.NhanVienThu || "NV003",
      MaChiNhanh: `CN0${(i % 8) + 1}`,
      ChungTuGoc: inv.MaHoaDon,
      GhiChu: "Quyết toán học phí kỳ đào tạo",
    });
  }

  // Phiếu chi hoạt động qua 3 năm (2024, 2025, 2026 đến Tháng 10/2026)
  const CHI_ITEMS = [
    { hangMuc: "ChiLuongGiangVien" as const, ten: "Chi lương giảng viên & Mentor chuyên môn (Toàn hệ thống)", tien: 45000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 1 (Tân Bình - Trụ sở chính)", tien: 35000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 2 (Gò Vấp)", tien: 28000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 3 (Quận 1 VIP)", tien: 42000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 4 (Quận 7 Phú Mỹ Hưng)", tien: 38000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 5 (TP. Thủ Đức Campus)", tien: 32000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 6 (Bình Thạnh)", tien: 30000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 7 (Cầu Giấy, Hà Nội)", tien: 36000000 },
    { hangMuc: "ChiThueMatBang" as const, ten: "Chi thuê mặt bằng Cơ sở 8 (Hải Châu, Đà Nẵng)", tien: 26000000 },
    { hangMuc: "ChiMarketing" as const, ten: "Chi phí quảng cáo Meta & Google Ads 8 cơ sở", tien: 22000000 },
    { hangMuc: "ChiGiaoTrinh" as const, ten: "In ấn giáo trình chuẩn Cambridge & Slide bài giảng IT", tien: 12500000 },
    { hangMuc: "ChiDienNuocCS" as const, ten: "Điện, nước, internet cáp quang phòng Lab 8 cơ sở", tien: 16800000 },
    { hangMuc: "ChiKhac" as const, ten: "Văn phòng phẩm, teabreak và bảo dưỡng thiết bị máy móc", tien: 5400000 },
  ];

  for (let i = 1; i <= 90; i++) {
    const item = CHI_ITEMS[(i - 1) % CHI_ITEMS.length];
    const expDate = get3YearDate(i + 15);
    const maPC = `PC-${expDate.slice(0, 7).replace("-", "")}-${String(i).padStart(3, "0")}`;
    list.push({
      MaPhieuTC: maPC,
      Loai: "Chi",
      HangMuc: item.hangMuc,
      TenHangMuc: `${item.ten} (Đợt ${i})`,
      SoTien: Math.round(item.tien / 2),
      HinhThuc: (i % 2 === 0) ? "ChuyenKhoan" : "TienMat",
      NgayGiaoDich: `${expDate} 14:00`,
      NguoiGiaoDich: "Ban Quản trị & Đối tác cung ứng",
      NhanVienThucHien: "NV003",
      MaChiNhanh: `CN0${(i % 8) + 1}`,
      GhiChu: "Duyệt chi theo định mức hoạt động của trung tâm",
    });
  }

  return list;
}

export const INITIAL_CASH_FLOW: PhieuThuChi[] = generateInitialCashFlow();

// ==========================================
// 15. THI ĐẦU VÀO PLACEMENT TESTS - 105 BÀI TEST
// ==========================================
function generateInitialPlacementTests(): BaiKiemTraDauVao[] {
  const tests: BaiKiemTraDauVao[] = [];
  const courses = INITIAL_COURSES;

  for (let i = 1; i <= 105; i++) {
    const maTest = `TEST-2026-${String(i).padStart(3, '0')}`;
    const ho = HO_DEM[i % HO_DEM.length];
    const ten = (i % 2 === 0) ? TEN_NAM[i % TEN_NAM.length] : TEN_NU[i % TEN_NU.length];
    const hoTen = `${ho} ${ten}`;
    const phone = `09${String(30000000 + i * 59231).slice(0, 8)}`;

    const nghe = Math.min(10, 5.0 + (i % 5) * 1.0);
    const doc = Math.min(10, 5.5 + (i % 4) * 1.0);
    const noi = Math.min(10, 4.5 + (i % 6) * 1.0);
    const viet = Math.min(10, 5.0 + (i % 5) * 1.0);
    const tongKet = Number(((nghe + doc + noi + viet) / 4).toFixed(1));
    const targetCourse = courses[i % courses.length];

    tests.push({
      MaTest: maTest,
      HoTen: hoTen,
      SoDienThoai: phone,
      Email: `test.${String(i).padStart(3, '0')}@gmail.com`,
      DiemNghe: nghe,
      DiemDoc: doc,
      DiemNoi: noi,
      DiemViet: viet,
      DiemTongKet: tongKet,
      TrinhDoHienTai: tongKet >= 7.0 ? 'B2 Intermediate' : tongKet >= 5.5 ? 'B1 Pre-Intermediate' : 'A2 Elementary',
      MucTieuDauRa: 'IELTS 6.5+ hoặc TOEIC 750+',
      KhoaHocDeXuat: targetCourse.TenKH,
      NgayKiemTra: get3YearDate(i),
      GiangVienCham: (i % 3 === 0) ? 'NV015' : (i % 3 === 1) ? 'NV016' : 'NV017',
      TrangThai: (i % 3 === 0) ? 'DaXepLop' : 'ChuaXepLop',
      NhanXet: tongKet >= 6.5 ? 'Ngữ pháp tốt, phản xạ nói tự tin' : 'Cần củng cố từ vựng và ngữ âm căn bản',
    });
  }

  return tests;
}

export const INITIAL_PLACEMENT_TESTS: BaiKiemTraDauVao[] = generateInitialPlacementTests();

// ==========================================
// 16. ĐƠN BẢO LƯU & CHUYỂN LỚP - 100 ĐƠN
// (50 Đơn chuyển lớp + 50 Đơn bảo lưu)
// ==========================================
function generateInitialTransfers(): DonBaoLuuChuyenLop[] {
  const requests: DonBaoLuuChuyenLop[] = [];

  for (let i = 1; i <= 100; i++) {
    const isTransfer = i % 2 === 0;
    const prefix = isTransfer ? 'DCL' : 'DBL';
    const maDon = `${prefix}-${String(i).padStart(3, '0')}`;
    const student = INITIAL_STUDENTS[i % INITIAL_STUDENTS.length];
    const oldCls = INITIAL_CLASSES[(i) % INITIAL_CLASSES.length];
    const newCls = isTransfer ? INITIAL_CLASSES[(i + 1) % INITIAL_CLASSES.length] : undefined;

    requests.push({
      MaDon: maDon,
      LoaiDon: isTransfer ? 'ChuyenLop' : 'BaoLuu',
      MaHV: student.MaHV,
      MaLopCu: oldCls.MaLop,
      MaLopMoi: newCls?.MaLop,
      LyDo: isTransfer ? 'Trùng lịch làm việc đột xuất, xin chuyển ca học phù hợp' : 'Bận thi tốt nghiệp và đi công tác, xin bảo lưu học phí 2 tháng',
      NgayNopDon: get3YearDate(i),
      NgayBatDauBaoLuu: !isTransfer ? '2026-06-25' : undefined,
      NgayKetThucBaoLuu: !isTransfer ? '2026-08-25' : undefined,
      ChenhLechHocPhi: 0,
      TrangThai: (i % 4 === 0) ? 'ChoDuyet' : 'DaDuyet',
      NguoiDuyet: 'NV004 (Đặng Văn Hùng)',
      GhiChu: 'Đã hoàn tất thủ tục điều chuyển học vụ',
    });
  }

  return requests;
}

export const INITIAL_TRANSFERS_DEFERRALS: DonBaoLuuChuyenLop[] = generateInitialTransfers();

// ==========================================
// 17. THÔNG BÁO TỰ ĐỘNG - 105 THÔNG BÁO
// ==========================================
function generateInitialNotifications(): ThongBao[] {
  const notifs: ThongBao[] = [];
  const channels: ThongBao['KenhGui'][] = ['Zalo', 'SMS', 'Email'];

  for (let i = 1; i <= 105; i++) {
    const maTB = `TB${String(i).padStart(3, '0')}`;
    const student = INITIAL_STUDENTS[i % INITIAL_STUDENTS.length];
    const channel = channels[i % channels.length];

    notifs.push({
      MaThongBao: maTB,
      TieuDe: (i % 3 === 0) ? 'Nhắc lịch thi kết thúc học phần' : (i % 2 === 0) ? 'Nhắc hạn thanh toán học phí' : 'Thông báo khai giảng lớp học mới',
      NoiDung: `Kính gửi học viên ${student.TenHV}, trung tâm KIẾN TRẺ xin gửi thông báo cập nhật về lớp học của bạn.`,
      Loai: (i % 3 === 0) ? 'DiemSo' : (i % 2 === 0) ? 'HocPhi' : 'LichHoc',
      NguoiNhan: `${student.TenHV} (${student.SoDienThoai})`,
      NgayGui: `${get3YearDate(i)} 09:00`,
      KenhGui: channel,
      TrangThai: 'DaGui',
    });
  }

  return notifs;
}

export const INITIAL_NOTIFICATIONS: ThongBao[] = generateInitialNotifications();

// ==========================================
// 18. VOUCHER KHUYẾN MÃI
// ==========================================
export const INITIAL_VOUCHERS: VoucherKhuyenMai[] = [
  {
    MaVoucher: 'KIENTRE10',
    TenChuongTrinh: 'Ưu đãi Khóa học Kiến Trẻ Education (Giảm 10%)',
    LoaiGiam: 'PhanTram',
    GiaTriGiam: 10,
    GiaTriToiDa: 1000000,
    DieuKienApDung: 'Áp dụng cho mọi khóa học ngoại ngữ và lập trình tại Kiến Trẻ',
    NgayHetHan: '2026-12-31',
    SoLuongConLai: 45,
    TrangThai: 'Active',
  },
  {
    MaVoucher: 'UFMSTUDENT',
    TenChuongTrinh: 'Học bổng Đồng hành Sinh viên UFM',
    LoaiGiam: 'SoTien',
    GiaTriGiam: 500000,
    DieuKienApDung: 'Dành riêng cho sinh viên Trường ĐH Tài chính - Marketing',
    NgayHetHan: '2026-10-30',
    SoLuongConLai: 80,
    TrangThai: 'Active',
  },
  {
    MaVoucher: 'EARLYBIRD',
    TenChuongTrinh: 'Đăng ký sớm trước ngày Khai giảng 10 ngày',
    LoaiGiam: 'SoTien',
    GiaTriGiam: 300000,
    DieuKienApDung: 'Áp dụng khi thanh toán 100% học phí trước ngày khai giảng',
    NgayHetHan: '2026-09-01',
    SoLuongConLai: 20,
    TrangThai: 'Active',
  },
];

// ==========================================
// 19. BIỂU ĐỒ DOANH THU 3 NĂM (2024, 2025, 2026) - 34 THÁNG
// Hiện tại: Tháng 10 năm 2026
// ==========================================
export const MONTHLY_REVENUE_CHART = [
  // --- NĂM 2024 (12 tháng) ---
  { thang: "01/24", doanhThu: 125000000, hocVien: 95 },
  { thang: "02/24", doanhThu: 138000000, hocVien: 105 },
  { thang: "03/24", doanhThu: 165000000, hocVien: 125 },
  { thang: "04/24", doanhThu: 152000000, hocVien: 115 },
  { thang: "05/24", doanhThu: 180000000, hocVien: 135 },
  { thang: "06/24", doanhThu: 195000000, hocVien: 148 },
  { thang: "07/24", doanhThu: 210000000, hocVien: 158 },
  { thang: "08/24", doanhThu: 188000000, hocVien: 142 },
  { thang: "09/24", doanhThu: 225000000, hocVien: 170 },
  { thang: "10/24", doanhThu: 205000000, hocVien: 155 },
  { thang: "11/24", doanhThu: 240000000, hocVien: 180 },
  { thang: "12/24", doanhThu: 265000000, hocVien: 198 },

  // --- NĂM 2025 (12 tháng) ---
  { thang: "01/25", doanhThu: 190000000, hocVien: 140 },
  { thang: "02/25", doanhThu: 215000000, hocVien: 160 },
  { thang: "03/25", doanhThu: 280000000, hocVien: 210 },
  { thang: "04/25", doanhThu: 260000000, hocVien: 195 },
  { thang: "05/25", doanhThu: 310000000, hocVien: 230 },
  { thang: "06/25", doanhThu: 345000000, hocVien: 255 },
  { thang: "07/25", doanhThu: 360000000, hocVien: 268 },
  { thang: "08/25", doanhThu: 335000000, hocVien: 250 },
  { thang: "09/25", doanhThu: 390000000, hocVien: 290 },
  { thang: "10/25", doanhThu: 375000000, hocVien: 280 },
  { thang: "11/25", doanhThu: 420000000, hocVien: 310 },
  { thang: "12/25", doanhThu: 460000000, hocVien: 340 },

  // --- NĂM 2026 (10 tháng đến Tháng 10/2026 Hiện tại) ---
  { thang: "01/26", doanhThu: 320000000, hocVien: 240 },
  { thang: "02/26", doanhThu: 350000000, hocVien: 260 },
  { thang: "03/26", doanhThu: 430000000, hocVien: 320 },
  { thang: "04/26", doanhThu: 465000000, hocVien: 345 },
  { thang: "05/26", doanhThu: 510000000, hocVien: 380 },
  { thang: "06/26", doanhThu: 540000000, hocVien: 400 },
  { thang: "07/26", doanhThu: 525000000, hocVien: 390 },
  { thang: "08/26", doanhThu: 495000000, hocVien: 370 },
  { thang: "09/26", doanhThu: 560000000, hocVien: 415 },
  { thang: "10/26", doanhThu: 585000000, hocVien: 435 },
];
