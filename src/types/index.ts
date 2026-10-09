export type UserRole = 'Admin' | 'GiaoVu' | 'KeToan' | 'GiangVien';

export interface NhanVien {
  MaNV: string;
  TenNV: string;
  TenDangNhap: string;
  MatKhau: string;
  Email?: string;
  SoDienThoai?: string;
  VaiTro: UserRole;
  BoPhong: string;
  NgayVaoLam: string;
  TrangThai: 'Active' | 'Inactive';
  NgayTao: string;
}

export interface ChiNhanh {
  MaChiNhanh: string;
  TenChiNhanh: string;
  DiaChi: string;
  SoDienThoai: string;
  QuanLyID: string;
}

export interface KhoaHoc {
  MaKH: string;
  TenKH: string;
  MoTa: string;
  HocPhi: number;
  ThoiLuong: number;
  NgayTao: string;
  TrangThai: 'Active' | 'Inactive';
}

export interface LopHoc {
  MaLop: string;
  TenLop: string;
  MaKH: string;
  NgayKhaiGiang: string;
  NgayKetThuc: string;
  SucChuaToiDa: number;
  SoLuongDaDangKy: number;
  NhanVienDayID?: string;
  MaChiNhanh?: string;
  TrangThai: 'DangChieuSinh' | 'DaKhaiGiang' | 'DaKetThuc';
  NgayTao: string;
}

export interface LichHoc {
  MaLichHoc: string;
  MaLop: string;
  ThuTrongTuan: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7' | 'Chủ nhật';
  GioBatDau: string;
  GioKetThuc: string;
  PhongHoc: string;
  GiangVienID?: string;
  MaChiNhanh: string;
}

export interface HocVien {
  MaHV: string;
  TenHV: string;
  SoDienThoai: string;
  Email?: string;
  NgaySinh?: string;
  GioiTinh: 'Nam' | 'Nữ';
  DiaChi?: string;
  ThanhPho?: string;
  QuanHuyen?: string;
  CMNDNumber?: string;
  NgayDangKyDau: string;
  TrangThai: 'Active' | 'Suspended';
  GhiChu?: string;
  AnhDaiDien?: string;
}

export interface PhieuGhiDanh {
  MaPhieuGhiDanh: string;
  MaHV: string;
  MaLop: string;
  NgayGhiDanh: string;
  LoaiGhiDanh: 'ChinhThuc' | 'GiuCho';
  HocPhi: number;
  TrangThai: 'ChinhThuc' | 'GiuCho' | 'Huy';
  GhiChu?: string;
  NhanVienTao?: string;
  NgayCapNhat?: string;
}

export interface HoaDon {
  MaHoaDon: string;
  MaPhieuGhiDanh: string;
  MaHV: string;
  TongTien: number;
  TienGiamGia: number;
  TienThucThu: number;
  TienConNo: number;
  HinhThucThanhToan: 'TienMat' | 'ChuyenKhoan' | 'TheATM' | 'QRCode';
  NgayHoaDon: string;
  NgayHanTraNo?: string;
  TrangThai: 'DaThanhToan' | 'PartialPay' | 'ChuaThanhToan';
  GhiChu?: string;
  NhanVienThu?: string;
  FileBienLai?: string;
}

export interface LichSuThanhToan {
  MaThanhToan: string;
  MaHoaDon: string;
  MaHV: string;
  SoTienThanhToan: number;
  HinhThucThanhToan: 'TienMat' | 'ChuyenKhoan' | 'TheATM' | 'QRCode';
  NgayThanhToan: string;
  NhanVienThu?: string;
  SoTheFISA?: string;
  MaGiaoDich?: string;
  GhiChu?: string;
}

// Chức năng Đào tạo: Điểm danh
export interface DiemDanh {
  MaDiemDanh: string;
  MaLop: string;
  MaHV: string;
  NgayHoc: string;
  TrangThai: 'CoMat' | 'Vang' | 'DiMuon' | 'CoPhep';
  GhiChu?: string;
}

// Chức năng Đào tạo: Điểm số & Xếp loại
export interface DiemSo {
  MaDiem: string;
  MaHV: string;
  MaLop: string;
  DiemChuyenCan: number;
  DiemGiuaKy: number;
  DiemCuoiKy: number;
  DiemTongKet: number;
  XepLoai: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
  TrangThaiQuaMon: boolean;
  NgayDanhGia: string;
  NhanXet?: string;
}

// Chức năng Đào tạo: Chứng chỉ
export interface ChungChi {
  MaChungChi: string;
  MaHV: string;
  MaLop: string;
  TenChungChi: string;
  NgayCap: string;
  XepLoai: string;
  SoHieu: string;
}

// Chức năng Đào tạo: Bài kiểm tra đầu vào (Placement Test)
export interface BaiKiemTraDauVao {
  MaTest: string;
  MaHV?: string;
  HoTen: string;
  SoDienThoai: string;
  Email?: string;
  DiemNghe: number;
  DiemDoc: number;
  DiemNoi: number;
  DiemViet: number;
  DiemTongKet: number;
  TrinhDoHienTai: string;
  MucTieuDauRa: string;
  KhoaHocDeXuat: string;
  NgayKiemTra: string;
  GiangVienCham: string;
  TrangThai: 'ChuaXepLop' | 'DaXepLop';
  NhanXet?: string;
}

// Chức năng Đào tạo & Vận hành: Đơn Bảo lưu & Chuyển lớp
export interface DonBaoLuuChuyenLop {
  MaDon: string;
  LoaiDon: 'BaoLuu' | 'ChuyenLop';
  MaHV: string;
  MaLopCu: string;
  MaLopMoi?: string;
  LyDo: string;
  NgayNopDon: string;
  NgayBatDauBaoLuu?: string;
  NgayKetThucBaoLuu?: string;
  ChenhLechHocPhi: number;
  TrangThai: 'ChoDuyet' | 'DaDuyet' | 'TuChoi';
  NguoiDuyet?: string;
  GhiChu?: string;
}

export type MucDoTiemNang =
  | 'Cần học gấp'
  | 'Đang cân nhắc'
  | 'Hỏi tham khảo thông tin'
  | 'Nong'
  | 'Am'
  | 'Lanh';

// Chức năng Kinh doanh: Quản lý Khách hàng tiềm năng & Tư vấn (CRM Leads)
export interface KhachHangTiemNang {
  MaLead: string;
  HoTen: string;
  SoDienThoai: string;
  Email?: string;
  KhoaHocQuanTam: string;
  Nguon: 'Facebook' | 'Website' | 'GioiThieu' | 'TrucTiep' | 'Workshop';
  MucDoTiemNang: MucDoTiemNang;
  TrangThai: 'Moi' | 'DangTuVan' | 'DaHenLich' | 'DaChuyenDoi' | 'Huy';
  NhanVienPhuTrach: string;
  NgayTiepNhan: string;
  LichHenTuVan?: string;
  GhiChu?: string;
}

// Chức năng Kinh doanh & Tài chính: Quản lý Thu - Chi (Sổ Quỹ Tiền Mặt & Ngân Hàng)
export interface PhieuThuChi {
  MaPhieuTC: string;
  Loai: 'Thu' | 'Chi';
  HangMuc:
    | 'ThuHocPhi'
    | 'ChiLuongGiangVien'
    | 'ChiThueMatBang'
    | 'ChiMarketing'
    | 'ChiGiaoTrinh'
    | 'ChiDienNuocCS'
    | 'ChiKhac';
  TenHangMuc: string;
  SoTien: number;
  HinhThuc: 'TienMat' | 'ChuyenKhoan';
  NgayGiaoDich: string;
  NguoiGiaoDich: string;
  NhanVienThucHien: string;
  MaChiNhanh: string;
  ChungTuGoc?: string;
  GhiChu?: string;
}

// Chức năng Khuyến mãi & Voucher
export interface VoucherKhuyenMai {
  MaVoucher: string;
  TenChuongTrinh: string;
  LoaiGiam: 'PhanTram' | 'SoTien';
  GiaTriGiam: number; // e.g. 10 (%) or 500000 (VNĐ)
  GiaTriToiDa?: number;
  DieuKienApDung: string;
  NgayHetHan: string;
  SoLuongConLai: number;
  TrangThai: 'Active' | 'Expired';
}

// Chức năng Thông báo tự động
export interface ThongBao {
  MaThongBao: string;
  TieuDe: string;
  NoiDung: string;
  Loai: 'LichHoc' | 'HocPhi' | 'DiemSo' | 'ChungChi';
  NguoiNhan: string;
  NgayGui: string;
  KenhGui: 'Email' | 'SMS' | 'Zalo';
  TrangThai: 'DaGui' | 'ChoGui';
}
