import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Save,
  Check,
  AlertCircle,
  Filter,
  Terminal,
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { classList, studentList, enrollmentList, attendanceList, saveAttendance, currentUser } = useApp();

  const isLecturer = currentUser?.VaiTro === 'GiangVien';
  const availableClasses = React.useMemo(() => {
    if (isLecturer && currentUser) {
      return classList.filter(
        c => c.NhanVienDayID === currentUser.MaNV || (c as any).MaGiangVien === currentUser.MaNV
      );
    }
    return classList;
  }, [isLecturer, currentUser, classList]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    availableClasses[0]?.MaLop || classList[0]?.MaLop || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, { status: 'CoMat' | 'Vang' | 'DiMuon' | 'CoPhep'; note: string }>
  >({});

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get active students enrolled in this class
  const enrolledStudents = enrollmentList
    .filter(e => e.MaLop === selectedClassId && e.TrangThai !== 'Huy')
    .map(e => {
      const student = studentList.find(s => s.MaHV === e.MaHV);
      return {
        maHV: e.MaHV,
        tenHV: student?.TenHV || 'Học viên',
        soDienThoai: student?.SoDienThoai || '—',
        email: student?.Email || '—',
      };
    });

  // Sync current date's attendance if already in DB
  React.useEffect(() => {
    const recordsMap: Record<string, { status: 'CoMat' | 'Vang' | 'DiMuon' | 'CoPhep'; note: string }> = {};

    enrolledStudents.forEach(st => {
      const found = attendanceList.find(
        a => a.MaLop === selectedClassId && a.MaHV === st.maHV && a.NgayHoc === selectedDate
      );
      if (found) {
        recordsMap[st.maHV] = { status: found.TrangThai, note: found.GhiChu || '' };
      } else {
        // default to CoMat
        recordsMap[st.maHV] = { status: 'CoMat', note: '' };
      }
    });

    setAttendanceRecords(recordsMap);
  }, [selectedClassId, selectedDate, enrolledStudents.length]);

  const handleSetStatus = (maHV: string, status: 'CoMat' | 'Vang' | 'DiMuon' | 'CoPhep') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [maHV]: { ...prev[maHV], status },
    }));
  };

  const handleSetNote = (maHV: string, note: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [maHV]: { ...prev[maHV], note },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: 'CoMat' | 'Vang' | 'DiMuon' | 'CoPhep'; note: string }> = {};
    enrolledStudents.forEach(st => {
      updated[st.maHV] = { status: 'CoMat', note: attendanceRecords[st.maHV]?.note || '' };
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAll = () => {
    setNotification(null);
    let successCount = 0;

    enrolledStudents.forEach(st => {
      const rec = attendanceRecords[st.maHV] || { status: 'CoMat', note: '' };
      saveAttendance({
        MaLop: selectedClassId,
        MaHV: st.maHV,
        NgayHoc: selectedDate,
        TrangThai: rec.status,
        GhiChu: rec.note,
      });
      successCount++;
    });

    setNotification({
      type: 'success',
      text: `Đã lưu thành công kết quả điểm danh cho ${successCount} học viên ngày ${formatDate(selectedDate)}!`,
    });
  };

  const selectedClass = classList.find(c => c.MaLop === selectedClassId);

  // Attendance stats for selected class today
  const totalEnrolled = enrolledStudents.length;
  const presentCount = Object.values(attendanceRecords).filter(r => r.status === 'CoMat').length;
  const lateCount = Object.values(attendanceRecords).filter(r => r.status === 'DiMuon').length;
  const absentCount = Object.values(attendanceRecords).filter(r => r.status === 'Vang').length;
  const excusedCount = Object.values(attendanceRecords).filter(r => r.status === 'CoPhep').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-blue-700" />
            <span>Quản lý Đào tạo · Điểm danh lớp học</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Ghi nhận chuyên cần, theo dõi học viên vắng/trễ theo từng buổi học trong chương trình đào tạo
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              type="button"
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng DiemDanh trong SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition"
          >
            Đánh dấu tất cả Có Mặt
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu điểm danh</span>
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

      {/* Selectors & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Chọn Lớp học:
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {availableClasses.map(cls => (
                <option key={cls.MaLop} value={cls.MaLop}>
                  {cls.TenLop} ({cls.MaLop})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ngày học:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div>
              <div className="text-[11px] text-slate-500">Sĩ số lớp: <span className="font-bold text-slate-900">{totalEnrolled} học viên</span></div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Khai giảng: <span className="font-mono">{formatDate(selectedClass?.NgayKhaiGiang)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-semibold text-[11px]">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Có mặt: {presentCount}
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Muộn: {lateCount}
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Vắng: {absentCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Danh sách học viên điểm danh ({enrolledStudents.length} học viên)
          </div>
          <div className="text-[11px] text-slate-400">
            Chọn trạng thái trực tiếp bằng các nút thao tác
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã HV</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Số ĐT</th>
                <th className="py-2.5 px-3 text-center">Trạng thái điểm danh</th>
                <th className="py-2.5 px-3">Ghi chú buổi học</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Lớp học này hiện chưa có học viên nào ghi danh.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((st, idx) => {
                  const currentStatus = attendanceRecords[st.maHV]?.status || 'CoMat';
                  const currentNote = attendanceRecords[st.maHV]?.note || '';

                  return (
                    <tr key={`${st.maHV}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.maHV}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{st.tenHV}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{st.soDienThoai}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.maHV, 'CoMat')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                              currentStatus === 'CoMat'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Có mặt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.maHV, 'DiMuon')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                              currentStatus === 'DiMuon'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Muộn
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.maHV, 'CoPhep')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                              currentStatus === 'CoPhep'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Có phép
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.maHV, 'Vang')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                              currentStatus === 'Vang'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Vắng
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={currentNote}
                          onChange={e => handleSetNote(st.maHV, e.target.value)}
                          placeholder="Nhập ghi chú thái độ, lý do..."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="DiemDanh"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
