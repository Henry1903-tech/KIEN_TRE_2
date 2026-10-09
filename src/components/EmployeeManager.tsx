import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NhanVien, UserRole } from '../types';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  UserCog,
  Search,
  Plus,
  Save,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';

export const EmployeeManager: React.FC = () => {
  const { staffList, addStaff, updateStaff, toggleStaffStatus, deleteStaff, currentUser } = useApp();

  const isAdmin = currentUser?.VaiTro === 'Admin';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<NhanVien | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NhanVien | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [formData, setFormData] = useState({
    MaNV: '',
    TenNV: '',
    TenDangNhap: '',
    MatKhau: '',
    Email: '',
    SoDienThoai: '',
    VaiTro: 'GiaoVu' as UserRole,
    BoPhong: 'Giáo vụ',
    NgayVaoLam: '2024-01-01',
    TrangThai: 'Active' as 'Active' | 'Inactive',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setSelectedStaff(null);
    setFormData({
      MaNV: '',
      TenNV: '',
      TenDangNhap: '',
      MatKhau: '123456',
      Email: '',
      SoDienThoai: '',
      VaiTro: 'GiaoVu',
      BoPhong: 'Giáo vụ',
      NgayVaoLam: '2024-01-01',
      TrangThai: 'Active',
    });
  };

  const handleSelectStaff = (st: NhanVien) => {
    setSelectedStaff(st);
    setIsEditing(true);
    setFormData({
      MaNV: st.MaNV,
      TenNV: st.TenNV,
      TenDangNhap: st.TenDangNhap,
      MatKhau: '', // Leave empty to keep unchanged
      Email: st.Email || '',
      SoDienThoai: st.SoDienThoai || '',
      VaiTro: st.VaiTro,
      BoPhong: st.BoPhong,
      NgayVaoLam: st.NgayVaoLam,
      TrangThai: st.TrangThai,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.TenNV.trim()) {
      setNotification({ type: 'error', text: 'Họ tên nhân viên không được để trống!' });
      return;
    }

    if (!formData.TenDangNhap.trim()) {
      setNotification({ type: 'error', text: 'Tên đăng nhập không được để trống!' });
      return;
    }

    if (!isEditing && !formData.MatKhau) {
      setNotification({ type: 'error', text: 'Vui lòng đặt mật khẩu khởi tạo cho nhân viên mới!' });
      return;
    }

    if (isEditing && selectedStaff) {
      const updated: NhanVien = {
        ...selectedStaff,
        TenNV: formData.TenNV.trim(),
        TenDangNhap: formData.TenDangNhap.trim(),
        MatKhau: formData.MatKhau.trim() ? formData.MatKhau.trim() : selectedStaff.MatKhau,
        Email: formData.Email.trim() || undefined,
        SoDienThoai: formData.SoDienThoai.trim() || undefined,
        VaiTro: formData.VaiTro,
        BoPhong: formData.BoPhong,
        NgayVaoLam: formData.NgayVaoLam,
        TrangThai: formData.TrangThai,
      };
      const res = updateStaff(updated);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) setSelectedStaff(updated);
    } else {
      const res = addStaff({
        TenNV: formData.TenNV.trim(),
        TenDangNhap: formData.TenDangNhap.trim(),
        MatKhau: formData.MatKhau.trim(),
        Email: formData.Email.trim() || undefined,
        SoDienThoai: formData.SoDienThoai.trim() || undefined,
        VaiTro: formData.VaiTro,
        BoPhong: formData.BoPhong,
        NgayVaoLam: formData.NgayVaoLam,
        TrangThai: formData.TrangThai,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const handleToggleStatus = (maNV: string) => {
    const res = toggleStaffStatus(maNV);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (selectedStaff?.MaNV === maNV) {
      setSelectedStaff(prev => (prev ? { ...prev, TrangThai: prev.TrangThai === 'Active' ? 'Inactive' : 'Active' } : null));
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const res = deleteStaff(deleteTarget.MaNV);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      if (selectedStaff?.MaNV === deleteTarget.MaNV) {
        resetForm();
      }
    }
    setDeleteTarget(null);
  };

  const filteredStaff = staffList.filter(s => {
    const kw = searchKeyword.toLowerCase();
    return (
      s.TenNV.toLowerCase().includes(kw) ||
      s.TenDangNhap.toLowerCase().includes(kw) ||
      s.MaNV.toLowerCase().includes(kw) ||
      s.VaiTro.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-700" />
            <span>Quản lý Nhân viên & Phân quyền (RBAC)</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Quản trị danh bạ nhân sự, cấp tài khoản và cấu hình vai trò bảo mật SHA-256
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, username, vai trò..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng NhanVien trong SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhân viên</span>
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center justify-between">
          <span>Phân quyền Giáo vụ: Bạn có quyền xem và cập nhật thông tin hồ sơ nhân sự/giảng viên. Việc cấp tài khoản, đổi mật khẩu và phân quyền vai trò do Quản trị viên (Admin) quản lý tập trung.</span>
          <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Hồ sơ Giảng viên</span>
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

      {/* Form Container (Hình 4.9 Thêm/Sửa Nhân viên) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>{isEditing ? 'Cập nhật thông tin Nhân viên' : 'Thêm mới Nhân viên & Tài khoản'}</span>
          {isEditing && (
            <span className="text-blue-700 font-mono font-bold">({selectedStaff?.MaNV})</span>
          )}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mã nhân viên (Tự động sinh)
              </label>
              <input
                type="text"
                value={formData.MaNV || '(Hệ thống tự cấp: NVxxx)'}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Họ và tên nhân viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.TenNV}
                onChange={e => setFormData({ ...formData, TenNV: e.target.value })}
                placeholder="Ví dụ: Nguyễn Thị Kim Anh"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tên đăng nhập (Username) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.TenDangNhap}
                onChange={e => setFormData({ ...formData, TenDangNhap: e.target.value })}
                disabled={!isAdmin}
                placeholder="kimanh, tuanta..."
                className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:outline-none ${
                  !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-600'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isEditing ? 'Đổi mật khẩu mới (Bỏ trống giữ cũ)' : 'Mật khẩu khởi tạo'}
              </label>
              <input
                type="password"
                value={formData.MatKhau}
                onChange={e => setFormData({ ...formData, MatKhau: e.target.value })}
                disabled={!isAdmin}
                placeholder={!isAdmin ? '(Chỉ Admin quản trị cấp phát)' : isEditing ? 'Để trống nếu không đổi...' : 'Mặc định: 123456'}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none ${
                  !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-600'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Vai trò phân quyền (RBAC) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.VaiTro}
                disabled={!isAdmin}
                onChange={e => {
                  const role = e.target.value as UserRole;
                  let dept = formData.BoPhong;
                  if (role === 'Admin') dept = 'Ban Giám Đốc';
                  else if (role === 'GiaoVu') dept = 'Giáo Vụ & Tuyển Sinh';
                  else if (role === 'KeToan') dept = 'Kế Toán - Tài Chính';
                  else if (role === 'GiangVien') dept = 'Giảng Dạy';

                  setFormData({
                    ...formData,
                    VaiTro: role,
                    BoPhong: dept,
                  });
                }}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none ${
                  !isAdmin ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-600'
                }`}
              >
                <option value="Admin">Admin (Toàn quyền quản trị)</option>
                <option value="GiaoVu">GiaoVu (Danh mục, học viên, ghi danh)</option>
                <option value="KeToan">KeToan (Thanh toán, hóa đơn, báo cáo)</option>
                <option value="GiangVien">GiangVien (Xem lịch và lớp phân công)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bộ phận công tác
              </label>
              <input
                type="text"
                value={formData.BoPhong}
                onChange={e => setFormData({ ...formData, BoPhong: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email nhân viên
              </label>
              <input
                type="email"
                value={formData.Email}
                onChange={e => setFormData({ ...formData, Email: e.target.value })}
                placeholder="nhanvien@kientre.edu.vn"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Trạng thái tài khoản
              </label>
              <select
                value={formData.TrangThai}
                onChange={e =>
                  setFormData({
                    ...formData,
                    TrangThai: e.target.value as 'Active' | 'Inactive',
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Active">Active (Hoạt động bình thường)</option>
                <option value="Inactive">Inactive (Khóa tài khoản)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              * Mật khẩu được mã hóa một chiều bằng hàm băm SHA-256 theo tiêu chuẩn bảo mật OWASP.
            </div>

            <div className="flex items-center gap-2">
              {isEditing && selectedStaff && currentUser?.MaNV !== selectedStaff.MaNV && isAdmin && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedStaff)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Staff Table (Hình 4.9 DataGridView) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Danh sách nhân viên ({filteredStaff.length})
          </div>
          <div className="text-[11px] text-slate-400">
            Click vào dòng để xem hoặc đổi vai trò
          </div>
        </div>

        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã NV</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3 font-mono">Tên đăng nhập</th>
                <th className="py-2.5 px-3">Vai trò</th>
                <th className="py-2.5 px-3">Bộ phận</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map(st => {
                const isSelected = selectedStaff?.MaNV === st.MaNV;
                const isSelf = currentUser?.MaNV === st.MaNV;

                return (
                  <tr
                    key={st.MaNV}
                    onClick={() => handleSelectStaff(st)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {st.MaNV}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.TenNV}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{st.TenDangNhap}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.VaiTro === 'Admin'
                            ? 'bg-blue-100 text-blue-800'
                            : st.VaiTro === 'KeToan'
                            ? 'bg-amber-100 text-amber-800'
                            : st.VaiTro === 'GiaoVu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {st.VaiTro}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{st.BoPhong}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {st.Email || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          st.TrangThai === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {st.TrangThai === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectStaff(st);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                        >
                          Sửa
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleStatus(st.MaNV);
                              }}
                              title={st.TrangThai === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
                              className={`p-1 rounded transition cursor-pointer ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : st.TrangThai === 'Active'
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {st.TrangThai === 'Active' ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteTarget(st);
                              }}
                              title={isSelf ? 'Không thể xóa chính bạn' : 'Xóa tài khoản nhân viên'}
                              className={`p-1 rounded transition cursor-pointer ${
                                isSelf
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Staff Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Xác nhận xóa tài khoản nhân viên</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn xóa nhân sự <b>{deleteTarget.TenNV}</b> ({deleteTarget.MaNV} - {deleteTarget.VaiTro}) khỏi hệ thống?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
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
          initialTable="NhanVien"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
