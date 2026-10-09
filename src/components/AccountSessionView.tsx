import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { formatDate } from '../utils/formatters';
import {
  User,
  ShieldCheck,
  Key,
  LogOut,
  Clock,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRightLeft,
  Shield,
  Layers,
} from 'lucide-react';

export const AccountSessionView: React.FC = () => {
  const { currentUser, staffList, switchRoleForDemo, logout } = useApp();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!oldPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại!' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Xác nhận mật khẩu mới không trùng khớp!' });
      return;
    }

    setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const roleDescriptions: Record<UserRole, { title: string; desc: string; color: string }> = {
    Admin: {
      title: 'Quản trị viên Hệ thống (System Admin)',
      desc: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản nhân viên, phân quyền RBAC và phê duyệt tài chính.',
      color: 'text-purple-700 bg-purple-100 border-purple-200',
    },
    GiaoVu: {
      title: 'Cán bộ Giáo vụ (Academic Affair)',
      desc: 'Quản lý khóa học, mở lớp, ghi danh, thời khóa biểu, điểm danh, bảng điểm và cấp chứng chỉ.',
      color: 'text-blue-700 bg-blue-100 border-blue-200',
    },
    KeToan: {
      title: 'Kế toán viên (Financial Accountant)',
      desc: 'Quản lý thu học phí, xuất hóa đơn, sinh mã VietQR, quản lý công nợ và sổ quỹ thu chi.',
      color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    },
    GiangVien: {
      title: 'Giảng viên chuyên môn (Instructor)',
      desc: 'Theo dõi lịch dạy, chấm bài thi đầu vào, điểm danh học viên và nhập điểm thành phần.',
      color: 'text-amber-700 bg-amber-100 border-amber-200',
    },
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700" />
            <span>Tài khoản & Phiên Đăng nhập Hệ thống</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị phiên làm việc hiện tại, đổi mật khẩu và chuyển đổi tài khoản theo phân quyền
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất phiên làm việc</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card: 7 cols */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {currentUser.TenNV.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{currentUser.TenNV}</h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleDescriptions[currentUser.VaiTro].color}`}>
                    {currentUser.VaiTro}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Mã nhân viên: <strong className="text-slate-800">{currentUser.MaNV}</strong> · Tên đăng nhập: <strong className="text-slate-800">{currentUser.TenDangNhap}</strong>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.BoPhong} · Công ty CP Đầu tư Giáo dục KIẾN TRẺ</span>
                </div>
              </div>
            </div>

            {/* Role scope box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Quyền hạn theo vai trò: {roleDescriptions[currentUser.VaiTro].title}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {roleDescriptions[currentUser.VaiTro].desc}
              </p>
            </div>

            {/* Profile Info Details */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px]">Email liên hệ</span>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.Email || 'tuanta@kientre.edu.vn'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Số điện thoại</span>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.SoDienThoai || '0903 123 456'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Ngày tiếp nhận công tác</span>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(currentUser.NgayVaoLam || '2023-08-01')}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Trạng thái tài khoản</span>
                <div className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đang hoạt động (Active)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Role Delegation panel (Only Admin has permission to change others' roles) */}
          {currentUser.VaiTro === 'Admin' ? (
            <div className="bg-white rounded-2xl border border-purple-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Đặc quyền Quản trị: Thay đổi vai trò nhân viên</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                  Chỉ dành cho Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Là Quản trị viên, bạn có quyền phân bổ hoặc thay đổi vai trò công tác (Admin, Giáo vụ, Kế toán, Giảng viên) cho các nhân sự trong hệ thống:
              </p>

              <AdminRoleAssigner />
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <span>Chính sách phân quyền RBAC</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Vai trò của bạn được cấp và quản lý tập trung bởi Quản trị viên (Admin). Nhân sự không có quyền tự thay đổi vai trò hoặc sửa quyền của người khác. Vui lòng liên hệ bộ phận IT/Quản trị hệ thống nếu cần điều chỉnh chức năng công tác.
              </p>
            </div>
          )}
        </div>

        {/* Right Form: Change Password: 5 cols */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Đổi mật khẩu tài khoản</span>
            </h3>
            <p className="text-xs text-slate-500">
              Định kỳ thay đổi mật khẩu ít nhất 90 ngày một lần để bảo vệ dữ liệu học viên và học phí
            </p>

            {passwordMsg && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại (mặc định: 123456)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition mt-2 cursor-pointer"
              >
                Cập nhật mật khẩu mới
              </button>
            </form>
          </div>

          {/* Audit log overview */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Nhật ký đăng nhập gần nhất</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Hôm nay, 08:30:15</span>
                <span className="text-emerald-700 font-semibold">Thành công (192.168.1.45)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Hôm qua, 14:12:08</span>
                <span className="text-emerald-700 font-semibold">Thành công (192.168.1.45)</span>
              </div>
              <div className="flex justify-between">
                <span>03/10/2026, 09:05:40</span>
                <span className="text-emerald-700 font-semibold">Thành công (115.79.20.10)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminRoleAssigner: React.FC = () => {
  const { staffList, updateStaff, currentUser } = useApp();
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[1]?.MaNV || '');
  const [newRole, setNewRole] = useState<UserRole>('GiaoVu');
  const [assignMsg, setAssignMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const targetStaff = staffList.find(s => s.MaNV === selectedStaffId);

  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaff) return;
    if (targetStaff.MaNV === currentUser?.MaNV && newRole !== 'Admin') {
      if (!window.confirm('Cảnh báo: Bạn đang tự hạ quyền Quản trị viên của chính mình! Tiếp tục?')) {
        return;
      }
    }

    const updated = { ...targetStaff, VaiTro: newRole };
    const res = updateStaff(updated);
    if (res.success) {
      setAssignMsg({
        type: 'success',
        text: `Đã cập nhật vai trò của nhân viên "${targetStaff.TenNV}" (${targetStaff.MaNV}) thành "${newRole}"!`,
      });
    } else {
      setAssignMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <form onSubmit={handleAssignRole} className="space-y-3 pt-1">
      {assignMsg && (
        <div
          className={`p-2.5 rounded-lg text-xs font-semibold ${
            assignMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {assignMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Chọn nhân viên cần phân lại vai trò:
          </label>
          <select
            value={selectedStaffId}
            onChange={e => {
              setSelectedStaffId(e.target.value);
              const found = staffList.find(s => s.MaNV === e.target.value);
              if (found) setNewRole(found.VaiTro);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
          >
            {staffList.map((st, idx) => (
              <option key={`${st.MaNV}-${idx}`} value={st.MaNV}>
                {st.MaNV} - {st.TenNV} ({st.VaiTro})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Chuyển sang vai trò mới:
          </label>
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
          >
            <option value="Admin">Admin - Quản trị viên toàn hệ thống</option>
            <option value="GiaoVu">GiaoVu - Cán bộ Giáo vụ đào tạo</option>
            <option value="KeToan">KeToan - Kế toán viên tài chính</option>
            <option value="GiangVien">GiangVien - Giảng viên chuyên môn</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">
          Chỉ có tài khoản Admin mới có quyền thực hiện thao tác này.
        </span>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          Xác nhận chuyển vai trò
        </button>
      </div>
    </form>
  );
};
