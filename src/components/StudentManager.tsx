import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HocVien } from '../types';
import { formatDate, formatVND } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  Users,
  Search,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Terminal,
} from 'lucide-react';

export const StudentManager: React.FC = () => {
  const {
    studentList,
    addStudent,
    updateStudent,
    softDeleteStudent,
    deleteStudent,
    enrollmentList,
    classList,
    invoiceList,
    currentUser,
  } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'KeToan';
  const isLecturer = currentUser?.VaiTro === 'GiangVien';

  // Classes taught by current lecturer
  const myClassIds = React.useMemo(() => {
    if (!isLecturer || !currentUser) return null;
    return new Set(classList.filter(c => c.NhanVienDayID === currentUser.MaNV).map(c => c.MaLop));
  }, [isLecturer, currentUser, classList]);

  const myEnrolledStudentIds = React.useMemo(() => {
    if (!myClassIds) return null;
    return new Set(
      enrollmentList
        .filter(e => myClassIds.has(e.MaLop) && e.TrangThai !== 'Huy')
        .map(e => e.MaHV)
    );
  }, [myClassIds, enrollmentList]);

  // Base list of students accessible to this user
  const accessibleStudents = React.useMemo(() => {
    if (isLecturer && myEnrolledStudentIds) {
      return studentList.filter(s => myEnrolledStudentIds.has(s.MaHV));
    }
    return studentList;
  }, [isLecturer, myEnrolledStudentIds, studentList]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<HocVien | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'history'>('info');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    MaHV: '',
    TenHV: '',
    SoDienThoai: '',
    Email: '',
    NgaySinh: '2000-01-01',
    GioiTinh: 'Nam' as 'Nam' | 'Nữ',
    DiaChi: '',
    QuanHuyen: '',
    ThanhPho: 'TP.HCM',
    CMNDNumber: '',
    GhiChu: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setSelectedStudent(null);
    setFormData({
      MaHV: '',
      TenHV: '',
      SoDienThoai: '',
      Email: '',
      NgaySinh: '2000-01-01',
      GioiTinh: 'Nam',
      DiaChi: '',
      QuanHuyen: 'Gò Vấp',
      ThanhPho: 'TP.HCM',
      CMNDNumber: '',
      GhiChu: '',
    });
  };

  const handleSelectStudent = (st: HocVien) => {
    setSelectedStudent(st);
    setIsEditing(true);
    setFormData({
      MaHV: st.MaHV,
      TenHV: st.TenHV,
      SoDienThoai: st.SoDienThoai,
      Email: st.Email || '',
      NgaySinh: st.NgaySinh || '2000-01-01',
      GioiTinh: st.GioiTinh,
      DiaChi: st.DiaChi || '',
      QuanHuyen: st.QuanHuyen || '',
      ThanhPho: st.ThanhPho || 'TP.HCM',
      CMNDNumber: st.CMNDNumber || '',
      GhiChu: st.GhiChu || '',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // Validate
    if (!formData.TenHV.trim()) {
      setNotification({ type: 'error', text: 'Họ tên học viên không được để trống!' });
      return;
    }

    const phoneRegex = /^(09|08|07|03)[0-9]{8}$/;
    if (!phoneRegex.test(formData.SoDienThoai.trim())) {
      setNotification({
        type: 'error',
        text: 'Số điện thoại không hợp lệ! Phải gồm 10 chữ số và bắt đầu bằng 09, 08, 07 hoặc 03.',
      });
      return;
    }

    if (formData.Email && !formData.Email.includes('@')) {
      setNotification({ type: 'error', text: 'Email không đúng định dạng!' });
      return;
    }

    if (isEditing && selectedStudent) {
      const updated: HocVien = {
        ...selectedStudent,
        TenHV: formData.TenHV.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        Email: formData.Email.trim() || undefined,
        NgaySinh: formData.NgaySinh,
        GioiTinh: formData.GioiTinh,
        DiaChi: formData.DiaChi.trim() || undefined,
        QuanHuyen: formData.QuanHuyen.trim() || undefined,
        ThanhPho: formData.ThanhPho.trim() || undefined,
        CMNDNumber: formData.CMNDNumber.trim() || undefined,
        GhiChu: formData.GhiChu.trim() || undefined,
      };
      const res = updateStudent(updated);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) {
        setSelectedStudent(updated);
      }
    } else {
      const res = addStudent({
        TenHV: formData.TenHV.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        Email: formData.Email.trim() || undefined,
        NgaySinh: formData.NgaySinh,
        GioiTinh: formData.GioiTinh,
        DiaChi: formData.DiaChi.trim() || undefined,
        QuanHuyen: formData.QuanHuyen.trim() || undefined,
        ThanhPho: formData.ThanhPho.trim() || undefined,
        CMNDNumber: formData.CMNDNumber.trim() || undefined,
        GhiChu: formData.GhiChu.trim() || undefined,
        TrangThai: 'Active',
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success && res.maHV) {
        setFormData(prev => ({ ...prev, MaHV: res.maHV! }));
      }
    }
  };

  const handleDelete = () => {
    if (!selectedStudent) return;
    if (window.confirm(`Chuyển trạng thái học viên ${selectedStudent.TenHV} (${selectedStudent.MaHV}) sang Tạm ngưng (Suspended)?`)) {
      const res = softDeleteStudent(selectedStudent.MaHV);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) {
        resetForm();
      }
    }
  };

  const handlePermanentDelete = () => {
    if (!selectedStudent) return;
    if (window.confirm(`XÓA VĨNH VIỄN học viên ${selectedStudent.TenHV} (${selectedStudent.MaHV}) khỏi hệ thống?`)) {
      const res = deleteStudent(selectedStudent.MaHV);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) {
        resetForm();
      }
    }
  };

  // Filter students
  const filteredStudents = accessibleStudents.filter(s => {
    const kw = searchKeyword.toLowerCase();
    return (
      s.TenHV.toLowerCase().includes(kw) ||
      s.SoDienThoai.includes(kw) ||
      s.MaHV.toLowerCase().includes(kw) ||
      (s.Email && s.Email.toLowerCase().includes(kw))
    );
  });

  // Student specific history
  const studentEnrollments = selectedStudent
    ? enrollmentList.filter(e => e.MaHV === selectedStudent.MaHV)
    : [];

  const studentInvoices = selectedStudent
    ? invoiceList.filter(i => i.MaHV === selectedStudent.MaHV)
    : [];

  return (
    <div className="space-y-6">
      {/* Title & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>Quản lý Hồ sơ học viên</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách học viên, lịch sử ghi danh và theo dõi học phí
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, SĐT, mã HV..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng HocVien trong CSDL SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          {!isReadOnly && !isLecturer && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mới</span>
            </button>
          )}
        </div>
      </div>

      {isLecturer && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center justify-between">
          <span>Phân quyền Giảng viên: Bạn chỉ xem danh sách học viên thuộc các lớp do mình trực tiếp giảng dạy ({accessibleStudents.length} học viên).</span>
          <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Chỉ xem lớp mình</span>
        </div>
      )}

      {isReadOnly && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>Phân quyền Kế toán: Bạn có quyền xem toàn bộ học viên ({accessibleStudents.length} học viên) để phục vụ thu học phí và kiểm tra công nợ.</span>
          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Chế độ xem</span>
        </div>
      )}

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

      {/* Top Form Container: Thông tin cơ bản / Lịch sử học tập (Hình 4.2) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 px-5 pt-3 flex items-center gap-6">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'info'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            disabled={!selectedStudent}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'border-blue-600 text-blue-700'
                : !selectedStudent
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              Lịch sử học tập & Học phí {selectedStudent ? `(${selectedStudent.MaHV})` : ''}
            </span>
          </button>
        </div>

        {activeSubTab === 'info' ? (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã học viên (Tự động sinh)
                </label>
                <input
                  type="text"
                  value={formData.MaHV || '(Hệ thống tự cấp: HVxxx)'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Họ và tên học viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.TenHV}
                  onChange={e => setFormData({ ...formData, TenHV: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Số điện thoại (10 số) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.SoDienThoai}
                  onChange={e => setFormData({ ...formData, SoDienThoai: e.target.value })}
                  placeholder="09xxxxxxxx / 08xxxxxxxx"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={e => setFormData({ ...formData, Email: e.target.value })}
                  placeholder="hocvien@email.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.NgaySinh}
                  onChange={e => setFormData({ ...formData, NgaySinh: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Giới tính
                </label>
                <div className="flex items-center gap-4 pt-2 text-xs text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gioitinh"
                      checked={formData.GioiTinh === 'Nam'}
                      onChange={() => setFormData({ ...formData, GioiTinh: 'Nam' })}
                      className="text-blue-600"
                    />
                    <span>Nam</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gioitinh"
                      checked={formData.GioiTinh === 'Nữ'}
                      onChange={() => setFormData({ ...formData, GioiTinh: 'Nữ' })}
                      className="text-blue-600"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  CMND/CCCD (9 hoặc 12 số)
                </label>
                <input
                  type="text"
                  value={formData.CMNDNumber}
                  onChange={e => setFormData({ ...formData, CMNDNumber: e.target.value })}
                  placeholder="079xxxxxxxx"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quận / Huyện & Thành phố
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.QuanHuyen}
                    onChange={e => setFormData({ ...formData, QuanHuyen: e.target.value })}
                    placeholder="Quận/Huyện"
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    value={formData.ThanhPho}
                    onChange={e => setFormData({ ...formData, ThanhPho: e.target.value })}
                    placeholder="Tỉnh/TP"
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  value={formData.DiaChi}
                  onChange={e => setFormData({ ...formData, DiaChi: e.target.value })}
                  placeholder="Số nhà, tên đường, phường..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={formData.GhiChu}
                  onChange={e => setFormData({ ...formData, GhiChu: e.target.value })}
                  placeholder="Thông tin nguyện vọng học tập, thời gian rảnh..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              {isReadOnly || isLecturer ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    Chế độ xem hồ sơ (Chỉ đọc)
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  {isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={handlePermanentDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        title="Xóa vĩnh viễn học viên khỏi cơ sở dữ liệu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa vĩnh viễn</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <span>Tạm ngưng (Soft Delete)</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ mới'}</span>
                  </button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4">
            {selectedStudent && (
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Học viên: {selectedStudent.TenHV} ({selectedStudent.MaHV})
                    </h3>
                    <div className="text-xs text-slate-500">
                      SĐT: {selectedStudent.SoDienThoai} · Đăng ký từ ngày: {formatDate(selectedStudent.NgayDangKyDau)}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      selectedStudent.TrangThai === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedStudent.TrangThai === 'Active' ? 'Đang theo học' : 'Tạm ngưng'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Danh sách lớp đã ghi danh */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Các lớp đã ghi danh</h4>
                    {studentEnrollments.length === 0 ? (
                      <p className="text-xs text-slate-400">Chưa có thông tin ghi danh lớp nào.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentEnrollments.map(e => {
                          const cls = classList.find(c => c.MaLop === e.MaLop);
                          return (
                            <div key={e.MaPhieuGhiDanh} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                              <div className="font-semibold text-slate-900">{cls?.TenLop || e.MaLop}</div>
                              <div className="text-slate-500 text-[11px]">
                                Mã phiếu: {e.MaPhieuGhiDanh} · Ngày: {e.NgayGhiDanh}
                              </div>
                              <div className="text-blue-700 font-mono font-medium mt-1">
                                Học phí: {formatVND(e.HocPhi)} ({e.LoaiGhiDanh})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lịch sử hóa đơn học phí */}
                  <div className="border border-slate-200 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Hóa đơn & Tình trạng nợ</h4>
                    {studentInvoices.length === 0 ? (
                      <p className="text-xs text-slate-400">Chưa có hóa đơn nào.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentInvoices.map(inv => (
                          <div key={inv.MaHoaDon} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-slate-800">{inv.MaHoaDon}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  inv.TrangThai === 'DaThanhToan'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.TrangThai === 'PartialPay'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {inv.TrangThai === 'DaThanhToan'
                                  ? 'ĐÃ ĐÓNG ĐỦ'
                                  : inv.TrangThai === 'PartialPay'
                                  ? 'CÒN NỢ'
                                  : 'CHƯA ĐÓNG'}
                              </span>
                            </div>
                            <div className="text-slate-600 mt-1 flex justify-between font-mono">
                              <span>Đã thu: {formatVND(inv.TienThucThu)}</span>
                              <span className={inv.TienConNo > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                Còn nợ: {formatVND(inv.TienConNo)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student List Table (Hình 4.2 DataGridView) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>Danh sách học viên</span>
            <span className="text-[11px] font-medium text-slate-500">
              ({filteredStudents.length} kết quả)
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Click vào dòng để xem chi tiết hoặc chỉnh sửa
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã HV</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Giới tính</th>
                <th className="py-2.5 px-3">Ngày sinh</th>
                <th className="py-2.5 px-3">Số ĐT</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Địa chỉ</th>
                <th className="py-2.5 px-3">Ngày đăng ký</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy học viên nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const isSelected = selectedStudent?.MaHV === st.MaHV;
                  return (
                    <tr
                      key={`${st.MaHV}-${idx}`}
                      onClick={() => handleSelectStudent(st)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">
                        {st.MaHV}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{st.TenHV}</td>
                      <td className="py-2.5 px-3">{st.GioiTinh}</td>
                      <td className="py-2.5 px-3 font-mono">{formatDate(st.NgaySinh)}</td>
                      <td className="py-2.5 px-3 font-mono">{st.SoDienThoai}</td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[150px] truncate">{st.Email || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate">
                        {[st.DiaChi, st.QuanHuyen, st.ThanhPho].filter(Boolean).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {formatDate(st.NgayDangKyDau)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            st.TrangThai === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {st.TrangThai === 'Active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectStudent(st);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                        >
                          Sửa
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
      {/* SQL Server Data Workbench Modal */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="HocVien"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
