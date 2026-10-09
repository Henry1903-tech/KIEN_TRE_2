import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KhoaHoc } from '../types';
import { formatVND } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  BookOpen,
  Search,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';

export const CourseManager: React.FC = () => {
  const { courseList, classList, addCourse, updateCourse, deleteCourse, currentUser } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'KeToan' || currentUser?.VaiTro === 'GiangVien';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<KhoaHoc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [formData, setFormData] = useState({
    MaKH: '',
    TenKH: '',
    MoTa: '',
    HocPhi: 3000000,
    ThoiLuong: 35,
    TrangThai: 'Active' as 'Active' | 'Inactive',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setSelectedCourse(null);
    setFormData({
      MaKH: '',
      TenKH: '',
      MoTa: '',
      HocPhi: 3000000,
      ThoiLuong: 35,
      TrangThai: 'Active',
    });
  };

  const handleSelectCourse = (c: KhoaHoc) => {
    setSelectedCourse(c);
    setIsEditing(true);
    setFormData({
      MaKH: c.MaKH,
      TenKH: c.TenKH,
      MoTa: c.MoTa,
      HocPhi: c.HocPhi,
      ThoiLuong: c.ThoiLuong,
      TrangThai: c.TrangThai,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.TenKH.trim()) {
      setNotification({ type: 'error', text: 'Tên khóa học không được để trống!' });
      return;
    }
    if (formData.HocPhi <= 0) {
      setNotification({ type: 'error', text: 'Học phí phải lớn hơn 0 VNĐ!' });
      return;
    }
    if (formData.ThoiLuong <= 0) {
      setNotification({ type: 'error', text: 'Thời lượng phải lớn hơn 0 giờ/buổi!' });
      return;
    }

    if (isEditing && selectedCourse) {
      const updated: KhoaHoc = {
        ...selectedCourse,
        TenKH: formData.TenKH.trim(),
        MoTa: formData.MoTa.trim(),
        HocPhi: formData.HocPhi,
        ThoiLuong: formData.ThoiLuong,
        TrangThai: formData.TrangThai,
      };
      const res = updateCourse(updated);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) setSelectedCourse(updated);
    } else {
      const res = addCourse({
        TenKH: formData.TenKH.trim(),
        MoTa: formData.MoTa.trim(),
        HocPhi: formData.HocPhi,
        ThoiLuong: formData.ThoiLuong,
        TrangThai: formData.TrangThai,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const handleDelete = () => {
    if (!selectedCourse) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học ${selectedCourse.TenKH} (${selectedCourse.MaKH})?`)) {
      const res = deleteCourse(selectedCourse.MaKH);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const filteredCourses = courseList.filter(c => {
    const kw = searchKeyword.toLowerCase();
    return c.TenKH.toLowerCase().includes(kw) || c.MaKH.toLowerCase().includes(kw);
  });

  return (
    <div className="space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            <span>Quản lý Khóa học</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Danh mục các chương trình đào tạo ngoại ngữ và công nghệ tại KIẾN TRẺ EDU
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên khóa học hoặc mã (Kxxx)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng KhoaHoc trong CSDL SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          {!isReadOnly && (
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

      {isReadOnly && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium flex items-center justify-between">
          <span>Phân quyền ({currentUser?.VaiTro === 'KeToan' ? 'Kế toán' : 'Giảng viên'}): Bạn có quyền xem toàn bộ danh mục khóa học để phục vụ công tác chuyên môn.</span>
          <span className="text-[11px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Chế độ xem</span>
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

      {/* Form Container (Matching Hình 4.3 Thêm/Sửa Khóa học) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>{isEditing ? 'Cập nhật thông tin Khóa học' : 'Thêm mới Khóa học'}</span>
          {isEditing && (
            <span className="text-blue-700 font-mono font-bold">({selectedCourse?.MaKH})</span>
          )}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mã khóa học (Tự động sinh)
              </label>
              <input
                type="text"
                value={formData.MaKH || '(Hệ thống tự cấp: Kxxx)'}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tên khóa học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.TenKH}
                onChange={e => setFormData({ ...formData, TenKH: e.target.value })}
                placeholder="Ví dụ: B2 IELTS Advanced (IELTS 6.5 - 7.5+)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Học phí (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={formData.HocPhi}
                onChange={e => setFormData({ ...formData, HocPhi: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Thời lượng (Buổi / Giờ)
              </label>
              <input
                type="number"
                min="1"
                value={formData.ThoiLuong}
                onChange={e => setFormData({ ...formData, ThoiLuong: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Trạng thái hoạt động
              </label>
              <select
                value={formData.TrangThai}
                onChange={e => setFormData({ ...formData, TrangThai: e.target.value as 'Active' | 'Inactive' })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Active">Active (Đang chiêu sinh)</option>
                <option value="Inactive">Inactive (Tạm ngưng)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mô tả chi tiết nội dung khóa học
              </label>
              <input
                type="text"
                value={formData.MoTa}
                onChange={e => setFormData({ ...formData, MoTa: e.target.value })}
                placeholder="Mục tiêu đầu ra, lộ trình học, giáo trình..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              * Quy tắc: Không thể xóa khóa học nếu đang có các lớp học liên kết trong CSDL.
            </div>

            <div className="flex items-center gap-2">
              {isReadOnly ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    Chế độ xem khóa học (Chỉ đọc)
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
                      <span>Xóa khóa học</span>
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
                    <span>{isEditing ? 'Lưu cập nhật' : 'Thêm khóa học'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Courses Table (Hình 4.3 DataGridView) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Danh sách khóa học ({filteredCourses.length})
          </div>
          <div className="text-[11px] text-slate-400">
            Click vào dòng để xem hoặc chỉnh sửa
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã KH</th>
                <th className="py-2.5 px-3">Tên khóa học</th>
                <th className="py-2.5 px-3 text-right">Học phí (VNĐ)</th>
                <th className="py-2.5 px-3 text-center">Thời lượng</th>
                <th className="py-2.5 px-3">Mô tả chương trình</th>
                <th className="py-2.5 px-3 text-center">Số lớp đang mở</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCourses.map(c => {
                const countClasses = classList.filter(l => l.MaKH === c.MaKH).length;
                const isSelected = selectedCourse?.MaKH === c.MaKH;
                return (
                  <tr
                    key={c.MaKH}
                    onClick={() => handleSelectCourse(c)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {c.MaKH}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.TenKH}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                      {formatVND(c.HocPhi)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{c.ThoiLuong}h</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-[240px] truncate">{c.MoTa}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                        {countClasses} lớp
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.TrangThai === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.TrangThai}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectCourse(c);
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
          initialTable="KhoaHoc"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
