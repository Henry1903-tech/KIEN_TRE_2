import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  Database,
  Table,
  GitFork,
  Shield,
  Layers,
  Code2,
  Terminal,
  Download,
  Building2,
  CheckCircle2,
  FileCode2,
  Server,
} from 'lucide-react';

export const DatabaseInfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'diagram' | 'procedures' | 'triggers' | 'views'>('tables');
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [selectedTableForWorkbench, setSelectedTableForWorkbench] = useState('HocVien');

  const openWorkbenchOnTable = (tbl: string) => {
    setSelectedTableForWorkbench(tbl);
    setShowWorkbench(true);
  };

  return (
    <div className="space-y-6">
      {/* Official Thesis & Database Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-emerald-900 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                CƠ SỞ DỮ LIỆU QUAN HỆ (MICROSOFT SQL SERVER)
              </span>
              <h1 className="text-lg font-extrabold text-white">
                DB_KIENTRE_EDU · Kiến Trúc CSDL Chuẩn BCNF
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openWorkbenchOnTable('HocVien')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Mở SQL Server Workbench</span>
            </button>
          </div>
        </div>

        {/* Thesis Title Box */}
        <div className="pt-2 border-t border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-emerald-300 font-semibold">Tên đề tài chính thức: </span>
            <span className="text-white font-medium">
              "PHÂN TÍCH, THIẾT KẾ VÀ XÂY DỰNG HỆ THỐNG QUẢN TRỊ ĐÀO TẠO VÀ KINH DOANH DỊCH VỤ GIÁO DỤC TẠI CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ"
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700">
              Boyce-Codd (BCNF)
            </span>
            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-900/80 text-blue-200 border border-blue-700">
              ACID Transaction
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'tables'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Danh Sách 12 Bảng Dữ Liệu</span>
        </button>
        <button
          onClick={() => setActiveTab('diagram')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'diagram'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Sơ đồ Quan Hệ Thực Thể (ERD)</span>
        </button>
        <button
          onClick={() => setActiveTab('procedures')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'procedures'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Stored Procedures T-SQL</span>
        </button>
        <button
          onClick={() => setActiveTab('triggers')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'triggers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Triggers Ràng Buộc</span>
        </button>
        <button
          onClick={() => setActiveTab('views')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'views'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Views Thống Kê KPI</span>
        </button>
      </div>

      {/* Tab 1: 12 BẢNG DỮ LIỆU */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Mỗi bảng dưới đây đều có thể kết nối, xem dữ liệu và thực thi câu lệnh trực tiếp qua <strong>SQL Server Workbench</strong>. Bấm nút "Mở bảng" để xem.
              </span>
            </div>
            <button
              onClick={() => openWorkbenchOnTable('HocVien')}
              className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold shrink-0 hover:bg-emerald-800 transition"
            >
              Mở SQL Explorer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* KhoaHoc */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">KhoaHoc</span>
                <button
                  onClick={() => openWorkbenchOnTable('KhoaHoc')}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaKH</span>: NVARCHAR(20) [PK]</div>
                <div>TenKH: NVARCHAR(200) [NOT NULL]</div>
                <div>MoTa: NVARCHAR(MAX)</div>
                <div>HocPhi: DECIMAL(15,2) [CHECK &gt; 0]</div>
                <div>ThoiLuong: INT [CHECK &gt; 0]</div>
                <div>TrangThai: NVARCHAR(50) [Active/Inactive]</div>
              </div>
            </div>

            {/* LopHoc */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">LopHoc</span>
                <button
                  onClick={() => openWorkbenchOnTable('LopHoc')}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaLop</span>: NVARCHAR(20) [PK]</div>
                <div>TenLop: NVARCHAR(200) [NOT NULL]</div>
                <div><span className="text-indigo-600 font-semibold">MaKH</span>: NVARCHAR(20) [FK -&gt; KhoaHoc]</div>
                <div>NgayKhaiGiang, NgayKetThuc: DATE</div>
                <div>SucChuaToiDa, SoLuongDaDangKy: INT</div>
                <div><span className="text-indigo-600 font-semibold">NhanVienDayID</span>: NVARCHAR(20) [FK]</div>
              </div>
            </div>

            {/* HocVien */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">HocVien</span>
                <button
                  onClick={() => openWorkbenchOnTable('HocVien')}
                  className="px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaHV</span>: NVARCHAR(20) [PK]</div>
                <div>TenHV: NVARCHAR(200) [NOT NULL]</div>
                <div>SoDienThoai: NVARCHAR(20) [UNIQUE]</div>
                <div>Email: NVARCHAR(150) [UNIQUE]</div>
                <div>CMNDNumber: NVARCHAR(20) [UNIQUE]</div>
                <div>TrangThai: NVARCHAR(50) [Active/Suspended]</div>
              </div>
            </div>

            {/* PhieuGhiDanh */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">PhieuGhiDanh</span>
                <button
                  onClick={() => openWorkbenchOnTable('PhieuGhiDanh')}
                  className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaPhieuGhiDanh</span>: NVARCHAR(50) [PK]</div>
                <div><span className="text-indigo-600 font-semibold">MaHV</span>: NVARCHAR(20) [FK -&gt; HocVien]</div>
                <div><span className="text-indigo-600 font-semibold">MaLop</span>: NVARCHAR(20) [FK -&gt; LopHoc]</div>
                <div>HocPhi: DECIMAL(15,2) [Snapshot]</div>
                <div>LoaiGhiDanh: NVARCHAR(50) [ChinhThuc/GiuCho]</div>
                <div>TrangThai: NVARCHAR(50) [ChinhThuc/GiuCho/Huy]</div>
              </div>
            </div>

            {/* HoaDon */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">HoaDon</span>
                <button
                  onClick={() => openWorkbenchOnTable('HoaDon')}
                  className="px-2 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaHoaDon</span>: NVARCHAR(50) [PK]</div>
                <div><span className="text-indigo-600 font-semibold">MaPhieuGhiDanh</span>: NVARCHAR(50) [FK]</div>
                <div><span className="text-indigo-600 font-semibold">MaHV</span>: NVARCHAR(20) [FK -&gt; HocVien]</div>
                <div>TongTien, TienGiamGia, TienThucThu</div>
                <div>TienConNo: DECIMAL(15,2) [CHECK &gt;= 0]</div>
                <div>TrangThai: DaThanhToan / PartialPay</div>
              </div>
            </div>

            {/* LichSuThanhToan */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">LichSuThanhToan</span>
                <button
                  onClick={() => openWorkbenchOnTable('LichSuThanhToan')}
                  className="px-2 py-0.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaThanhToan</span>: NVARCHAR(50) [PK]</div>
                <div><span className="text-indigo-600 font-semibold">MaHoaDon</span>: NVARCHAR(50) [FK]</div>
                <div><span className="text-indigo-600 font-semibold">MaHV</span>: NVARCHAR(20) [FK]</div>
                <div>SoTienThanhToan: DECIMAL(15,2) [CHECK &gt; 0]</div>
                <div>HinhThucThanhToan: QRCode / TienMat...</div>
                <div>NgayThanhToan: DATETIME [DEFAULT GETDATE()]</div>
              </div>
            </div>

            {/* SoQuyThuChi */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">SoQuyThuChi</span>
                <button
                  onClick={() => openWorkbenchOnTable('SoQuyThuChi')}
                  className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaPhieuTC</span>: NVARCHAR(50) [PK]</div>
                <div>Loai: NVARCHAR(10) [Thu/Chi]</div>
                <div>HangMuc: ThuHocPhi, ChiLuongGiangVien...</div>
                <div>SoTien: DECIMAL(15,2) [CHECK &gt; 0]</div>
                <div>HinhThuc: TienMat / ChuyenKhoan</div>
                <div>MaChiNhanh: NVARCHAR(20) [FK]</div>
              </div>
            </div>

            {/* DiemSo */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">DiemSo</span>
                <button
                  onClick={() => openWorkbenchOnTable('DiemSo')}
                  className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaDiem</span>: NVARCHAR(20) [PK]</div>
                <div><span className="text-indigo-600 font-semibold">MaHV</span>: NVARCHAR(20) [FK]</div>
                <div><span className="text-indigo-600 font-semibold">MaLop</span>: NVARCHAR(20) [FK]</div>
                <div>DiemChuyenCan, DiemGiuaKy, DiemCuoiKy</div>
                <div>DiemTongKet: DECIMAL(4,2) [0-10]</div>
                <div>TrangThaiQuaMon: BIT [1/0]</div>
              </div>
            </div>

            {/* NhanVien */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs hover:border-emerald-400 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 font-mono text-sm">NhanVien</span>
                <button
                  onClick={() => openWorkbenchOnTable('NhanVien')}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold cursor-pointer"
                >
                  Xem T-SQL &rarr;
                </button>
              </div>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div><span className="text-blue-700 font-bold">MaNV</span>: NVARCHAR(20) [PK]</div>
                <div>TenNV: NVARCHAR(200) [NOT NULL]</div>
                <div>TenDangNhap: NVARCHAR(100) [UNIQUE]</div>
                <div>Email: NVARCHAR(150) [@kientre.edu.vn]</div>
                <div>VaiTro: Admin, GiaoVu, KeToan, GiangVien</div>
                <div>TrangThai: NVARCHAR(50) [Active]</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SƠ ĐỒ ERD */}
      {activeTab === 'diagram' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Sơ đồ Quan Hệ Thực Thể CSDL DB_KIENTRE_EDU (Boyce-Codd Normal Form)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu trúc chuẩn hóa 1-N loại bỏ hoàn toàn dị thường thêm, xóa, sửa (Insert, Delete, Update Anomalies).
              </p>
            </div>
            <button
              onClick={() => openWorkbenchOnTable('HocVien')}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
            >
              Mở SQL Server Workbench
            </button>
          </div>

          <div className="p-6 bg-slate-950 text-cyan-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
            <pre>{`
  [ ChiNhanh ] (MaChiNhanh, TenChiNhanh, DiaChi, QuanLyID)
       │ 1
       │ N
       ▼
  [ KhoaHoc ] (MaKH, TenKH, HocPhi, ThoiLuong)
       │ 1
       │ N
       ▼
  [ LopHoc ] (MaLop, MaKH, SucChua, SoLuongDaDangKy) ──┐
       │ 1                                             │
       │ N                                             │
       ▼                                               │
  [ PhieuGhiDanh ] (MaPhieu, MaHV, MaLop, HocPhi) ◄────┘
       │ 1                   ▲
       │ N                   │ 1
       ▼                     │ N
  [ HoaDon ] ────────── [ HocVien ] (MaHV, TenHV, SoDienThoai)
       │ 1                   ▲              ▲
       │ N                   │ 1            │ 1
       ▼                     │ N            │ N
  [ LichSuThanhToan ] ───────┘         [ DiemSo ] (MaDiem, MaHV, MaLop, DiemTongKet)
                                            ▲
  [ SoQuyThuChi ] (MaPhieuTC, Loai, SoTien) │
                                       [ LichHoc ] (MaLichHoc, MaLop, ThuTrongTuan)
            `}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: STORED PROCEDURES */}
      {activeTab === 'procedures' && (
        <div className="space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 font-mono">SP_ThanhToanHocPhi</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Transaction ACID Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Kiểm tra số tiền thanh toán (&gt; 0 và &le; dư nợ hiện tại), cập nhật số tiền thực thu, tính lại dư nợ còn thiếu trên hóa đơn, và tự động INSERT bản ghi LichSuThanhToan trong một giao dịch BEGIN TRAN / COMMIT nguyên tử.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 font-mono">SP_GhiDanhHocVien</span>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                Sĩ số & Tạo hóa đơn tự động
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Kiểm tra sĩ số lớp học còn chỗ trống (SoLuongDaDangKy &lt; SucChuaToiDa), thêm mới phiếu ghi danh và tự động phát sinh hóa đơn học phí tương ứng với chính sách ưu đãi của khóa học.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 font-mono">SP_DangNhapNhanVien</span>
              <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                Xác thực & RBAC Session
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Kiểm tra thông tin tài khoản nhân viên KIẾN TRẺ, xác thực trạng thái hoạt động (TrangThai = 'Active') và trả về danh sách quyền hạn vai trò (Admin, GiaoVu, KeToan, GiangVien).
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: TRIGGERS */}
      {activeTab === 'triggers' && (
        <div className="space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 font-mono">TRG_PhieuGhiDanh_CapNhatSiSo</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                AFTER INSERT, DELETE, UPDATE
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Tự động tính toán lại và cập nhật chính xác số lượng học viên đã đăng ký `SoLuongDaDangKy` trong bảng LopHoc khi có phiếu ghi danh mới hoặc khi học viên hủy / bảo lưu / chuyển lớp.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 font-mono">TRG_HoaDon_BaoVeDoanhThu</span>
              <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold">
                INSTEAD OF DELETE
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Lớp bảo vệ dữ liệu tài chính tối cao của KIẾN TRẺ: Tuyệt đối ngăn chặn hành động xóa hóa đơn nếu hóa đơn đó đã phát sinh thực thu tiền mặt hoặc ngân hàng (`TienThucThu &gt; 0`).
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: VIEWS */}
      {activeTab === 'views' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold font-mono text-emerald-700 block">V_EnrollmentDetails</span>
            <p className="text-slate-500">
              JOIN 5 bảng hiển thị chi tiết hồ sơ ghi danh, học viên, lớp học và khóa học tại KIẾN TRẺ.
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold font-mono text-emerald-700 block">V_PaymentStatus</span>
            <p className="text-slate-500">
              Thống kê tình trạng nộp học phí, tiền đã thanh toán và danh sách học viên nợ quá hạn.
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold font-mono text-emerald-700 block">V_ClassAvailable</span>
            <p className="text-slate-500">
              Liệt kê danh sách các lớp học còn chỗ trống phục vụ công tác tuyển sinh và xếp lớp nhanh chóng.
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold font-mono text-emerald-700 block">V_DoanhThuTheoChiNhanh</span>
            <p className="text-slate-500">
              Tổng hợp doanh số thu học phí và chi phí vận hành phân bổ theo từng cơ sở đào tạo của KIẾN TRẺ.
            </p>
          </div>
        </div>
      )}

      {/* SQL Server Modal Launcher */}
      {showWorkbench && (
        <SqlServerWorkbenchModal
          initialTable={selectedTableForWorkbench}
          onClose={() => setShowWorkbench(false)}
        />
      )}
    </div>
  );
};
