import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LichHoc } from '../types';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';

export const ScheduleManager: React.FC = () => {
  const { scheduleList, classList, staffList, branchList, addSchedule, updateSchedule, deleteSchedule, currentUser } = useApp();

  const isLecturer = currentUser?.VaiTro === 'GiangVien';

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [deleteTargetSchedule, setDeleteTargetSchedule] = useState<LichHoc | null>(null);

  const teachers = staffList.filter(s => s.VaiTro === 'GiangVien' && s.TrangThai === 'Active');

  const [formData, setFormData] = useState({
    MaLop: classList[0]?.MaLop || '',
    ThuTrongTuan: 'Thứ 2' as LichHoc['ThuTrongTuan'],
    GioBatDau: '18:00',
    GioKetThuc: '19:30',
    PhongHoc: 'Phòng Lab 101',
    GiangVienID: teachers[0]?.MaNV || 'NV015',
    MaChiNhanh: 'CN01',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const daysOfWeek: LichHoc['ThuTrongTuan'][] = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
  ];

  const resetForm = () => {
    setIsEditing(false);
    setEditingScheduleId(null);
    setFormData({
      MaLop: classList[0]?.MaLop || '',
      ThuTrongTuan: 'Thứ 2',
      GioBatDau: '18:00',
      GioKetThuc: '19:30',
      PhongHoc: 'Phòng Lab 101',
      GiangVienID: teachers[0]?.MaNV || 'NV015',
      MaChiNhanh: 'CN01',
    });
  };

  const handleEditSchedule = (sch: LichHoc) => {
    setIsEditing(true);
    setEditingScheduleId(sch.MaLichHoc);
    setFormData({
      MaLop: sch.MaLop,
      ThuTrongTuan: sch.ThuTrongTuan,
      GioBatDau: sch.GioBatDau,
      GioKetThuc: sch.GioKetThuc,
      PhongHoc: sch.PhongHoc,
      GiangVienID: sch.GiangVienID || teachers[0]?.MaNV || 'NV015',
      MaChiNhanh: sch.MaChiNhanh,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.MaLop) {
      setNotification({ type: 'error', text: 'Vui lòng chọn lớp học!' });
      return;
    }

    if (isEditing && editingScheduleId) {
      const res = updateSchedule({
        MaLichHoc: editingScheduleId,
        ...formData,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    } else {
      const res = addSchedule(formData);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetSchedule) return;
    const res = deleteSchedule(deleteTargetSchedule.MaLichHoc);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (editingScheduleId === deleteTargetSchedule.MaLichHoc) resetForm();
    setDeleteTargetSchedule(null);
  };

  const filteredSchedules = scheduleList.filter(s => {
    if (isLecturer && currentUser && s.GiangVienID !== currentUser.MaNV) {
      return false;
    }
    return filterBranch === 'all' || s.MaChiNhanh === filterBranch;
  });

  return (
    <div className="space-y-6">
      {/* Title & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-700" />
            <span>Quản lý Đào tạo · Thời khóa biểu & Lịch học</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Sắp xếp ca học theo thứ trong tuần, phân bổ phòng máy, giảng đường và cơ sở đào tạo
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Branch filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shadow-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả cơ sở</option>
              {branchList.map(b => (
                <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                  {b.TenChiNhanh}
                </option>
              ))}
            </select>
          </div>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng LichHoc trong SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          {/* Grid / Table toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ma trận tuần
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách chi tiết
            </button>
          </div>
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

      {isLecturer ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center justify-between">
          <span>Phân quyền Giảng viên: Bạn đang xem thời khóa biểu các ca dạy của chính mình ({filteredSchedules.length} ca dạy).</span>
          <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Lịch dạy cá nhân</span>
        </div>
      ) : (
        /* Form: Thêm ca học mới */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>{isEditing ? `Chỉnh sửa ca học (${editingScheduleId})` : 'Phân bổ ca học mới'}</span>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-normal cursor-pointer"
              >
                Hủy chế độ sửa
              </button>
            )}
          </h2>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Lớp học
              </label>
              <select
                value={formData.MaLop}
                onChange={e => setFormData({ ...formData, MaLop: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {classList.map(cls => (
                  <option key={cls.MaLop} value={cls.MaLop}>
                    {cls.TenLop} ({cls.MaLop})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Thứ trong tuần
              </label>
              <select
                value={formData.ThuTrongTuan}
                onChange={e => setFormData({ ...formData, ThuTrongTuan: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Giờ học
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={formData.GioBatDau}
                  onChange={e => setFormData({ ...formData, GioBatDau: e.target.value })}
                  placeholder="18:00"
                  className="w-full px-2 py-1.5 text-center font-mono text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.GioKetThuc}
                  onChange={e => setFormData({ ...formData, GioKetThuc: e.target.value })}
                  placeholder="19:30"
                  className="w-full px-2 py-1.5 text-center font-mono text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phòng học
              </label>
              <input
                type="text"
                value={formData.PhongHoc}
                onChange={e => setFormData({ ...formData, PhongHoc: e.target.value })}
                placeholder="Lab 101, A202..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cập nhật lịch học' : 'Xếp lịch'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View 1: Weekly Timetable Grid */}
      {viewMode === 'grid' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-200 text-xs font-bold text-slate-800">
            Thời khóa biểu các ngày trong tuần (KIẾN TRẺ EDU)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
            {daysOfWeek.map(day => {
              const daySchedules = filteredSchedules.filter(s => s.ThuTrongTuan === day);

              return (
                <div key={day} className="min-h-[300px] flex flex-col">
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-center font-bold text-slate-800 uppercase text-[11px]">
                    {day}
                  </div>

                  <div className="p-2 flex-1 space-y-2">
                    {daySchedules.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-300 text-[11px] italic py-8">
                        Không có ca
                      </div>
                    ) : (
                      daySchedules.map(sch => {
                        const cls = classList.find(c => c.MaLop === sch.MaLop);
                        const teacher = staffList.find(s => s.MaNV === sch.GiangVienID);
                        const branch = branchList.find(b => b.MaChiNhanh === sch.MaChiNhanh);

                        return (
                          <div
                            key={sch.MaLichHoc}
                            className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1 relative group hover:bg-blue-100/70 transition"
                          >
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => handleEditSchedule(sch)}
                                className="text-slate-500 hover:text-blue-700 p-0.5 cursor-pointer"
                                title="Sửa ca học"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTargetSchedule(sch)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="Xóa ca học"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="font-bold text-slate-900 leading-tight">
                              {cls?.TenLop || sch.MaLop}
                            </div>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-blue-800 font-semibold">
                              <Clock className="w-3 h-3" />
                              <span>
                                {sch.GioBatDau} - {sch.GioKetThuc}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-800">{sch.PhongHoc}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{teacher?.TenNV || 'Giảng viên'}</span>
                            </div>
                            <div className="text-[9px] text-blue-600 font-semibold mt-0.5">
                              {branch?.TenChiNhanh.replace('Cơ sở ', 'CS ')}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: Detailed Table */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Mã lịch</th>
                <th className="py-2.5 px-3">Lớp học</th>
                <th className="py-2.5 px-3">Thứ</th>
                <th className="py-2.5 px-3 font-mono">Khung giờ</th>
                <th className="py-2.5 px-3">Phòng học</th>
                <th className="py-2.5 px-3">Giảng viên</th>
                <th className="py-2.5 px-3">Cơ sở</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSchedules.map(sch => {
                const cls = classList.find(c => c.MaLop === sch.MaLop);
                const teacher = staffList.find(s => s.MaNV === sch.GiangVienID);
                const branch = branchList.find(b => b.MaChiNhanh === sch.MaChiNhanh);

                return (
                  <tr key={sch.MaLichHoc} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{sch.MaLichHoc}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{cls?.TenLop || sch.MaLop}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{sch.ThuTrongTuan}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">
                      {sch.GioBatDau} - {sch.GioKetThuc}
                    </td>
                    <td className="py-2 px-3">{sch.PhongHoc}</td>
                    <td className="py-2 px-3">{teacher?.TenNV || '—'}</td>
                    <td className="py-2 px-3 text-slate-600">{branch?.TenChiNhanh}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditSchedule(sch)}
                          className="text-slate-500 hover:text-blue-700 p-1 cursor-pointer"
                          title="Sửa ca học"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetSchedule(sch)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Xóa ca học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Schedule Confirmation Modal */}
      {deleteTargetSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa ca học</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn xóa lịch học <b>{deleteTargetSchedule.MaLichHoc}</b> ({deleteTargetSchedule.ThuTrongTuan} {deleteTargetSchedule.GioBatDau}-{deleteTargetSchedule.GioKetThuc})?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTargetSchedule(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
          initialTable="LichHoc"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
