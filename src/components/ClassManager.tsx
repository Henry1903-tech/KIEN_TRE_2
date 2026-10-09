import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LopHoc } from '../types';
import { formatDate } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  School,
  Search,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Filter,
  Terminal,
  Building2,
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const { classList, courseList, staffList, branchList, addClass, updateClass, deleteClass, currentUser } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'KeToan';
  const isLecturer = currentUser?.VaiTro === 'GiangVien';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [selectedClass, setSelectedClass] = useState<LopHoc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const teachers = staffList.filter(s => s.VaiTro === 'GiangVien' && s.TrangThai === 'Active');

  const accessibleClasses = React.useMemo(() => {
    if (isLecturer && currentUser) {
      return classList.filter(
        c => c.NhanVienDayID === currentUser.MaNV || (c as any).MaGiangVien === currentUser.MaNV
      );
    }
    return classList;
  }, [isLecturer, currentUser, classList]);

  const [formData, setFormData] = useState({
    MaLop: '',
    TenLop: '',
    MaKH: courseList[0]?.MaKH || 'K001',
    MaChiNhanh: branchList[0]?.MaChiNhanh || 'CN01',
    NgayKhaiGiang: '2026-10-15',
    NgayKetThuc: '2026-12-30',
    SucChuaToiDa: 30,
    NhanVienDayID: teachers[0]?.MaNV || 'NV015',
    TrangThai: 'DangChieuSinh' as 'DangChieuSinh' | 'DaKhaiGiang' | 'DaKetThuc',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setSelectedClass(null);
    setFormData({
      MaLop: '',
      TenLop: '',
      MaKH: courseList[0]?.MaKH || 'K001',
      MaChiNhanh: branchList[0]?.MaChiNhanh || 'CN01',
      NgayKhaiGiang: '2026-10-15',
      NgayKetThuc: '2026-12-30',
      SucChuaToiDa: 30,
      NhanVienDayID: teachers[0]?.MaNV || 'NV015',
      TrangThai: 'DangChieuSinh',
    });
  };

  const handleSelectClass = (cls: LopHoc) => {
    setSelectedClass(cls);
    setIsEditing(true);
    setFormData({
      MaLop: cls.MaLop,
      TenLop: cls.TenLop,
      MaKH: cls.MaKH,
      MaChiNhanh: cls.MaChiNhanh || branchList[0]?.MaChiNhanh || 'CN01',
      NgayKhaiGiang: cls.NgayKhaiGiang,
      NgayKetThuc: cls.NgayKetThuc,
      SucChuaToiDa: cls.SucChuaToiDa,
      NhanVienDayID: cls.NhanVienDayID || '',
      TrangThai: cls.TrangThai,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.TenLop.trim()) {
      setNotification({ type: 'error', text: 'Tên lớp học không được để trống!' });
      return;
    }

    if (new Date(formData.NgayKetThuc) < new Date(formData.NgayKhaiGiang)) {
      setNotification({
        type: 'error',
        text: 'Ràng buộc RB03: Ngày kết thúc khóa học phải lớn hơn hoặc bằng ngày khai giảng!',
      });
      return;
    }

    if (formData.SucChuaToiDa < 5 || formData.SucChuaToiDa > 50) {
      setNotification({ type: 'error', text: 'Sức chứa tối đa của lớp phải từ 5 đến 50 học viên!' });
      return;
    }

    if (isEditing && selectedClass) {
      const updated: LopHoc = {
        ...selectedClass,
        TenLop: formData.TenLop.trim(),
        MaKH: formData.MaKH,
        MaChiNhanh: formData.MaChiNhanh,
        NgayKhaiGiang: formData.NgayKhaiGiang,
        NgayKetThuc: formData.NgayKetThuc,
        SucChuaToiDa: formData.SucChuaToiDa,
        NhanVienDayID: formData.NhanVienDayID || undefined,
        TrangThai: formData.TrangThai,
      };
      const res = updateClass(updated);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) setSelectedClass(updated);
    } else {
      const res = addClass({
        TenLop: formData.TenLop.trim(),
        MaKH: formData.MaKH,
        MaChiNhanh: formData.MaChiNhanh,
        NgayKhaiGiang: formData.NgayKhaiGiang,
        NgayKetThuc: formData.NgayKetThuc,
        SucChuaToiDa: formData.SucChuaToiDa,
        NhanVienDayID: formData.NhanVienDayID || undefined,
        TrangThai: formData.TrangThai,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const handleDelete = () => {
    if (!selectedClass) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp học ${selectedClass.TenLop} (${selectedClass.MaLop})?`)) {
      const res = deleteClass(selectedClass.MaLop);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const filteredClasses = accessibleClasses.filter(cls => {
    const kw = searchKeyword.toLowerCase();
    const matchesKeyword =
      cls.TenLop.toLowerCase().includes(kw) ||
      cls.MaLop.toLowerCase().includes(kw) ||
      cls.MaKH.toLowerCase().includes(kw);
    const matchesCourse = filterCourse === 'all' || cls.MaKH === filterCourse;
    const matchesBranch = filterBranch === 'all' || cls.MaChiNhanh === filterBranch;
    return matchesKeyword && matchesCourse && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-5 h-5 text-blue-700" />
            <span>Quản lý Lớp học</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Lịch khai giảng, phân bổ giảng viên và theo dõi sĩ số thực tế
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm tên lớp, mã lớp..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả khóa học</option>
              {courseList.map(c => (
                <option key={c.MaKH} value={c.MaKH}>
                  {c.MaKH} - {c.TenKH}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả 8 cơ sở</option>
              {branchList.map(b => (
                <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                  {b.MaChiNhanh} - {b.TenChiNhanh}
                </option>
              ))}
            </select>
          </div>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng LopHoc trong CSDL SQL Server"
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
              <span>Mở lớp mới</span>
            </button>
          )}
        </div>
      </div>

      {isLecturer && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center justify-between">
          <span>Phân quyền Giảng viên: Bạn chỉ xem danh sách các lớp do mình trực tiếp giảng dạy ({accessibleClasses.length} lớp học).</span>
          <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Chỉ xem lớp mình</span>
        </div>
      )}

      {isReadOnly && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>Phân quyền Kế toán: Bạn có quyền xem toàn bộ danh mục lớp học ({accessibleClasses.length} lớp) để phục vụ đối soát học phí.</span>
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

      {/* Form Container (Hình 4.4 Thêm/Sửa Lớp học) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>{isEditing ? 'Cập nhật thông tin Lớp học' : 'Khai giảng Lớp học mới'}</span>
          {isEditing && (
            <span className="text-blue-700 font-mono font-bold">({selectedClass?.MaLop})</span>
          )}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Khóa học đào tạo <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.MaKH}
                onChange={e => setFormData({ ...formData, MaKH: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {courseList.map(c => (
                  <option key={c.MaKH} value={c.MaKH}>
                    {c.MaKH} - {c.TenKH}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Cơ sở trực thuộc (8 Cơ sở) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.MaChiNhanh}
                onChange={e => setFormData({ ...formData, MaChiNhanh: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {branchList.map(b => (
                  <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                    {b.MaChiNhanh} - {b.TenChiNhanh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mã lớp học (Tự động theo khóa)
              </label>
              <input
                type="text"
                value={formData.MaLop || `(Hệ thống tự cấp: ${formData.MaKH}-Lxx)`}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tên lớp học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.TenLop}
                onChange={e => setFormData({ ...formData, TenLop: e.target.value })}
                placeholder="Ví dụ: Lớp 1A - Giao Tiếp Khởi Đầu"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ngày khai giảng
              </label>
              <input
                type="date"
                value={formData.NgayKhaiGiang}
                onChange={e => setFormData({ ...formData, NgayKhaiGiang: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.NgayKetThuc}
                onChange={e => setFormData({ ...formData, NgayKetThuc: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Sức chứa tối đa (5 - 50 học viên)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={formData.SucChuaToiDa}
                onChange={e => setFormData({ ...formData, SucChuaToiDa: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Giảng viên phân công
              </label>
              <select
                value={formData.NhanVienDayID}
                onChange={e => setFormData({ ...formData, NhanVienDayID: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Chưa phân công --</option>
                {teachers.map(t => (
                  <option key={t.MaNV} value={t.MaNV}>
                    {t.MaNV} - {t.TenNV} ({t.BoPhong})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Trạng thái chiêu sinh
              </label>
              <select
                value={formData.TrangThai}
                onChange={e =>
                  setFormData({
                    ...formData,
                    TrangThai: e.target.value as 'DangChieuSinh' | 'DaKhaiGiang' | 'DaKetThuc',
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="DangChieuSinh">Đang chiêu sinh (DangChieuSinh)</option>
                <option value="DaKhaiGiang">Đã khai giảng (DaKhaiGiang)</option>
                <option value="DaKetThuc">Đã kết thúc (DaKetThuc)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              * Sĩ số tự động đếm bởi Trigger TRG_PhieuGhiDanh_UpdateClass khi có phiếu ghi danh.
            </div>

            <div className="flex items-center gap-2">
              {isReadOnly || isLecturer ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    Chế độ xem lớp học (Chỉ đọc)
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa lớp</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Lưu cập nhật' : 'Mở lớp mới'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Classes Table (Hình 4.4 DataGridView) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Danh sách lớp học ({filteredClasses.length})
          </div>
          <div className="text-[11px] text-slate-400">
            Click vào dòng để xem hoặc chỉnh sửa
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã lớp</th>
                <th className="py-2.5 px-3">Tên lớp</th>
                <th className="py-2.5 px-3">Khóa học</th>
                <th className="py-2.5 px-3">Cơ sở</th>
                <th className="py-2.5 px-3 font-mono">Ngày KG</th>
                <th className="py-2.5 px-3 font-mono">Ngày KT</th>
                <th className="py-2.5 px-3 text-center">Sức chứa</th>
                <th className="py-2.5 px-3 text-center">Sĩ số hiện tại</th>
                <th className="py-2.5 px-3">Giảng viên</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClasses.map(cls => {
                const course = courseList.find(c => c.MaKH === cls.MaKH);
                const teacher = staffList.find(s => s.MaNV === cls.NhanVienDayID);
                const isSelected = selectedClass?.MaLop === cls.MaLop;
                const ratio = Math.round((cls.SoLuongDaDangKy / cls.SucChuaToiDa) * 100);

                return (
                  <tr
                    key={cls.MaLop}
                    onClick={() => handleSelectClass(cls)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {cls.MaLop}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{cls.TenLop}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate">
                      {course?.TenKH || cls.MaKH}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {cls.MaChiNhanh || 'CN01'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {formatDate(cls.NgayKhaiGiang)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {formatDate(cls.NgayKetThuc)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{cls.SucChuaToiDa}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {cls.SoLuongDaDangKy}/{cls.SucChuaToiDa}
                        </span>
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, ratio)}%` }}
                            className={`h-full ${
                              ratio >= 90 ? 'bg-rose-500' : ratio >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {teacher ? teacher.TenNV : <span className="text-slate-400">Chưa gán</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cls.TrangThai === 'DangChieuSinh'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cls.TrangThai === 'DaKhaiGiang'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cls.TrangThai === 'DangChieuSinh'
                          ? 'Chiêu sinh'
                          : cls.TrangThai === 'DaKhaiGiang'
                          ? 'Đang học'
                          : 'Kết thúc'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectClass(cls);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* SQL Server Data Workbench Modal */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="LopHoc"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
