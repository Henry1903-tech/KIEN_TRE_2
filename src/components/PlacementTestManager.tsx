import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BaiKiemTraDauVao } from '../types';
import { formatDate } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  GraduationCap,
  Search,
  Plus,
  Save,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  BookOpen,
  Filter,
  Terminal,
} from 'lucide-react';

export const PlacementTestManager: React.FC = () => {
  const {
    placementTestList,
    courseList,
    classList,
    staffList,
    addPlacementTest,
    updatePlacementTest,
    deletePlacementTest,
    createEnrollment,
    addStudent,
    studentList,
    currentUser,
  } = useApp();

  const isAcademicStaff = currentUser?.VaiTro === 'Admin' || currentUser?.VaiTro === 'GiaoVu';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [deleteTargetTest, setDeleteTargetTest] = useState<BaiKiemTraDauVao | null>(null);
  const [enrollingTest, setEnrollingTest] = useState<BaiKiemTraDauVao | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const teachers = staffList.filter(s => s.VaiTro === 'GiangVien' && s.TrangThai === 'Active');

  const [formData, setFormData] = useState({
    HoTen: '',
    SoDienThoai: '',
    Email: '',
    DiemNghe: 6.0,
    DiemDoc: 6.0,
    DiemNoi: 6.0,
    DiemViet: 6.0,
    TrinhDoHienTai: 'A2 (Pre-Intermediate)',
    MucTieuDauRa: 'IELTS 6.5',
    KhoaHocDeXuat: courseList[0]?.TenKH || 'B1 IELTS Preparation',
    GiangVienCham: teachers[0]?.TenNV || 'TS. Lâm Hoàng Trúc Mai',
    NhanXet: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setEditingTestId(null);
    setFormData({
      HoTen: '',
      SoDienThoai: '',
      Email: '',
      DiemNghe: 6.0,
      DiemDoc: 6.0,
      DiemNoi: 6.0,
      DiemViet: 6.0,
      TrinhDoHienTai: 'A2 (Pre-Intermediate)',
      MucTieuDauRa: 'IELTS 6.5',
      KhoaHocDeXuat: courseList[0]?.TenKH || 'B1 IELTS Preparation',
      GiangVienCham: teachers[0]?.TenNV || 'TS. Lâm Hoàng Trúc Mai',
      NhanXet: '',
    });
  };

  const handleEditTest = (test: BaiKiemTraDauVao) => {
    setIsEditing(true);
    setEditingTestId(test.MaTest);
    setFormData({
      HoTen: test.HoTen,
      SoDienThoai: test.SoDienThoai,
      Email: test.Email || '',
      DiemNghe: test.DiemNghe,
      DiemDoc: test.DiemDoc,
      DiemNoi: test.DiemNoi,
      DiemViet: test.DiemViet,
      TrinhDoHienTai: test.TrinhDoHienTai,
      MucTieuDauRa: test.MucTieuDauRa,
      KhoaHocDeXuat: test.KhoaHocDeXuat,
      GiangVienCham: test.GiangVienCham,
      NhanXet: test.NhanXet || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmDeleteTest = () => {
    if (!deleteTargetTest) return;
    const res = deletePlacementTest(deleteTargetTest.MaTest);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (editingTestId === deleteTargetTest.MaTest) resetForm();
    setDeleteTargetTest(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.HoTen.trim()) {
      setNotification({ type: 'error', text: 'Vui lòng nhập họ tên học viên kiểm tra!' });
      return;
    }
    if (!formData.SoDienThoai.trim()) {
      setNotification({ type: 'error', text: 'Vui lòng nhập số điện thoại liên hệ!' });
      return;
    }

    const diemTb = Number(
      ((formData.DiemNghe + formData.DiemDoc + formData.DiemNoi + formData.DiemViet) / 4).toFixed(1)
    );

    if (isEditing && editingTestId) {
      const existing = placementTestList.find(t => t.MaTest === editingTestId);
      if (!existing) return;
      const res = updatePlacementTest({
        ...existing,
        HoTen: formData.HoTen.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        Email: formData.Email.trim() || undefined,
        DiemNghe: Number(formData.DiemNghe),
        DiemDoc: Number(formData.DiemDoc),
        DiemNoi: Number(formData.DiemNoi),
        DiemViet: Number(formData.DiemViet),
        DiemTongKet: diemTb,
        TrinhDoHienTai: formData.TrinhDoHienTai,
        MucTieuDauRa: formData.MucTieuDauRa,
        KhoaHocDeXuat: formData.KhoaHocDeXuat,
        GiangVienCham: formData.GiangVienCham,
        NhanXet: formData.NhanXet.trim() || undefined,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    } else {
      const res = addPlacementTest({
        HoTen: formData.HoTen.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        Email: formData.Email.trim() || undefined,
        DiemNghe: Number(formData.DiemNghe),
        DiemDoc: Number(formData.DiemDoc),
        DiemNoi: Number(formData.DiemNoi),
        DiemViet: Number(formData.DiemViet),
        DiemTongKet: diemTb,
        TrinhDoHienTai: formData.TrinhDoHienTai,
        MucTieuDauRa: formData.MucTieuDauRa,
        KhoaHocDeXuat: formData.KhoaHocDeXuat,
        GiangVienCham: formData.GiangVienCham,
        NhanXet: formData.NhanXet.trim() || undefined,
      });

      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  // Convert placement test to class enrollment
  const handleEnrollFromTest = () => {
    if (!enrollingTest || !selectedClassId) {
      setNotification({ type: 'error', text: 'Vui lòng chọn lớp học để xếp lớp!' });
      return;
    }

    // 1. Check or create student
    let student = studentList.find(s => s.SoDienThoai === enrollingTest.SoDienThoai);
    let targetMaHV = student?.MaHV;

    if (!student) {
      const studentRes = addStudent({
        TenHV: enrollingTest.HoTen,
        SoDienThoai: enrollingTest.SoDienThoai,
        Email: enrollingTest.Email,
        GioiTinh: 'Nam',
        TrangThai: 'Active',
        GhiChu: `Đã hoàn thành bài test đầu vào ${enrollingTest.MaTest} (${enrollingTest.DiemTongKet} điểm)`,
      });
      if (!studentRes.success || !studentRes.maHV) {
        setNotification({ type: 'error', text: studentRes.message });
        return;
      }
      targetMaHV = studentRes.maHV;
    }

    // 2. Enroll student into class
    const enrollRes = createEnrollment(targetMaHV!, selectedClassId, 'ChinhThuc', `Xếp lớp từ kết quả Test ${enrollingTest.MaTest}`);
    if (enrollRes.success) {
      setNotification({
        type: 'success',
        text: `Đã xếp lớp thành công học viên ${enrollingTest.HoTen} vào lớp ${selectedClassId}!`,
      });
      setEnrollingTest(null);
    } else {
      setNotification({ type: 'error', text: enrollRes.message });
    }
  };

  const filteredTests = placementTestList.filter(t => {
    const kw = searchKeyword.toLowerCase();
    const matchKw =
      t.HoTen.toLowerCase().includes(kw) ||
      t.SoDienThoai.includes(kw) ||
      t.MaTest.toLowerCase().includes(kw) ||
      t.KhoaHocDeXuat.toLowerCase().includes(kw);
    const matchStatus = filterStatus === 'all' || t.TrangThai === filterStatus;
    return matchKw && matchStatus;
  });

  const recruitingClasses = classList.filter(c => c.TrangThai === 'DangChieuSinh');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-700" />
            <span>Khảo sát Trình độ & Kiểm tra Đầu vào (Placement Test)</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Đánh giá 4 kỹ năng ngôn ngữ hoặc tư duy lập trình, định hướng lộ trình học và xếp lớp phù hợp
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng BaiKiemTraDauVao trong SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          <button
            onClick={resetForm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nhập kết quả test mới</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100">
          Nhập hồ sơ khảo sát trình độ đầu vào
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Họ và tên thí sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.HoTen}
                onChange={e => setFormData({ ...formData, HoTen: e.target.value })}
                placeholder="Ví dụ: Nguyễn Hải Đăng"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.SoDienThoai}
                onChange={e => setFormData({ ...formData, SoDienThoai: e.target.value })}
                placeholder="09xxxxxxxx"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mục tiêu đầu ra mong muốn
              </label>
              <input
                type="text"
                value={formData.MucTieuDauRa}
                onChange={e => setFormData({ ...formData, MucTieuDauRa: e.target.value })}
                placeholder="IELTS 6.5+, TOEIC 750, C# .NET..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Khóa học đề xuất
              </label>
              <select
                value={formData.KhoaHocDeXuat}
                onChange={e => setFormData({ ...formData, KhoaHocDeXuat: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {courseList.map(c => (
                  <option key={c.MaKH} value={c.TenKH}>
                    {c.TenKH}
                  </option>
                ))}
              </select>
            </div>

            {/* 4 Skill Scores */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Điểm Nghe (Listening)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.DiemNghe}
                onChange={e => setFormData({ ...formData, DiemNghe: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Điểm Đọc (Reading)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.DiemDoc}
                onChange={e => setFormData({ ...formData, DiemDoc: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Điểm Nói / Logic (Speaking)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.DiemNoi}
                onChange={e => setFormData({ ...formData, DiemNoi: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Điểm Viết / Code (Writing)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.DiemViet}
                onChange={e => setFormData({ ...formData, DiemViet: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Trình độ đánh giá hiện tại
              </label>
              <input
                type="text"
                value={formData.TrinhDoHienTai}
                onChange={e => setFormData({ ...formData, TrinhDoHienTai: e.target.value })}
                placeholder="A1, A2, B1, B2..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Giảng viên khảo thí
              </label>
              <select
                value={formData.GiangVienCham}
                onChange={e => setFormData({ ...formData, GiangVienCham: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {teachers.map(t => (
                  <option key={t.MaNV} value={t.TenNV}>
                    {t.TenNV} ({t.BoPhong})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Điểm trung bình tự động
              </label>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg font-mono font-bold text-sm text-blue-800 text-center">
                {((formData.DiemNghe + formData.DiemDoc + formData.DiemNoi + formData.DiemViet) / 4).toFixed(1)} / 10
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nhận xét năng lực & Điểm mạnh/yếu
            </label>
            <input
              type="text"
              value={formData.NhanXet}
              onChange={e => setFormData({ ...formData, NhanXet: e.target.value })}
              placeholder="Ghi chú chi tiết về khả năng phát âm, ngữ pháp, độ nhạy bén..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Hủy chế độ sửa
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? `Cập nhật bài test (${editingTestId})` : 'Lưu kết quả kiểm tra'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table List of Placement Tests */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-800">
            Danh sách bài kiểm tra đầu vào ({filteredTests.length})
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="Tìm thí sinh, mã test..."
                className="w-full pl-9 pr-3 py-1 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ChuaXepLop">Chưa xếp lớp</option>
                <option value="DaXepLop">Đã xếp lớp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Mã Test</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Số ĐT</th>
                <th className="py-2.5 px-3 text-center">Nghe / Đọc / Nói / Viết</th>
                <th className="py-2.5 px-3 text-center">Tổng điểm</th>
                <th className="py-2.5 px-3">Trình độ & Khóa đề xuất</th>
                <th className="py-2.5 px-3">Giảng viên chấm</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Xếp lớp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTests.map(t => (
                <tr key={t.MaTest} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{t.MaTest}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{t.HoTen}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{t.SoDienThoai}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                    {t.DiemNghe} / {t.DiemDoc} / {t.DiemNoi} / {t.DiemViet}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-800 text-sm">
                    {t.DiemTongKet}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{t.KhoaHocDeXuat}</div>
                    <div className="text-[10px] text-slate-500">Trình độ: {t.TrinhDoHienTai}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{t.GiangVienCham}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.TrangThai === 'DaXepLop'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {t.TrangThai === 'DaXepLop' ? 'Đã xếp lớp' : 'Chờ xếp lớp'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isAcademicStaff && (
                        t.TrangThai !== 'DaXepLop' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEnrollingTest(t);
                              setSelectedClassId(recruitingClasses[0]?.MaLop || '');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Xếp lớp</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Hoàn tất</span>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditTest(t)}
                        className="p-1 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded transition cursor-pointer"
                        title="Chỉnh sửa điểm và kết quả test"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isAcademicStaff && (
                        <button
                          type="button"
                          onClick={() => setDeleteTargetTest(t)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Xóa bài kiểm tra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xếp lớp từ bài Test */}
      {enrollingTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Xếp lớp đào tạo từ kết quả kiểm tra</span>
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>
                Học viên: <span className="font-bold text-slate-900">{enrollingTest.HoTen}</span> (SĐT: {enrollingTest.SoDienThoai})
              </div>
              <div>
                Điểm test: <span className="font-mono font-bold text-blue-700">{enrollingTest.DiemTongKet}/10</span> · Khóa học đề xuất:{' '}
                <span className="font-semibold text-slate-900">{enrollingTest.KhoaHocDeXuat}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn lớp học phù hợp để xếp lớp:
              </label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {recruitingClasses.map(cls => (
                  <option key={cls.MaLop} value={cls.MaLop}>
                    {cls.TenLop} ({cls.MaLop} - Sĩ số: {cls.SoLuongDaDangKy}/{cls.SucChuaToiDa})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEnrollingTest(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleEnrollFromTest}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Xác nhận ghi danh vào lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Test Confirmation Modal */}
      {deleteTargetTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa kết quả thi đầu vào</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn xóa bài kiểm tra <b>{deleteTargetTest.MaTest}</b> của thí sinh <b>{deleteTargetTest.HoTen}</b>?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTargetTest(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTest}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="BaiKiemTraDauVao"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
