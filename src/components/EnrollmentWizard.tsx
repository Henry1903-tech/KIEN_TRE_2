import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HocVien } from '../types';
import { formatVND, formatDate } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  ClipboardPenLine,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  Trash2,
  UserCheck,
  School,
  FileText,
  UserPlus,
  Terminal,
} from 'lucide-react';

interface EnrollmentWizardProps {
  onNavigateToPayment: (maPhieuGhiDanh: string) => void;
  onOpenStudentTab: () => void;
}

export const EnrollmentWizard: React.FC<EnrollmentWizardProps> = ({
  onNavigateToPayment,
  onOpenStudentTab,
}) => {
  const {
    studentList,
    courseList,
    classList,
    enrollmentList,
    createEnrollment,
    cancelEnrollment,
    currentUser,
  } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'KeToan';

  // Wizard state
  const [phoneOrCodeSearch, setPhoneOrCodeSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<HocVien | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseList[0]?.MaKH || '');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loaiGhiDanh, setLoaiGhiDanh] = useState<'ChinhThuc' | 'GiuCho'>('ChinhThuc');
  const [ghiChu, setGhiChu] = useState('');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewReceiptEnrollment, setPreviewReceiptEnrollment] = useState<string | null>(null);

  // Available classes for selected course (only classes with available seats and recruiting)
  const availableClasses = classList.filter(
    cls => cls.MaKH === selectedCourseId && cls.TrangThai === 'DangChieuSinh'
  );

  const selectedCourse = courseList.find(c => c.MaKH === selectedCourseId);
  const selectedClass = classList.find(c => c.MaLop === selectedClassId);

  // Step 1: Search student
  const handleSearchStudent = () => {
    setNotification(null);
    const kw = phoneOrCodeSearch.trim().toLowerCase();
    if (!kw) {
      setNotification({ type: 'error', text: 'Vui lòng nhập Số điện thoại hoặc Mã học viên để tìm kiếm!' });
      return;
    }

    const found = studentList.find(
      s => s.SoDienThoai === kw || s.MaHV.toLowerCase() === kw || s.TenHV.toLowerCase().includes(kw)
    );

    if (found) {
      if (found.TrangThai === 'Suspended') {
        setNotification({
          type: 'error',
          text: `Học viên ${found.TenHV} (${found.MaHV}) đang ở trạng thái Tạm ngưng, không thể ghi danh!`,
        });
        setSelectedStudent(null);
      } else {
        setSelectedStudent(found);
        setNotification({
          type: 'success',
          text: `Tìm thấy học viên: ${found.TenHV} (SĐT: ${found.SoDienThoai})`,
        });
      }
    } else {
      setSelectedStudent(null);
      setNotification({
        type: 'error',
        text: 'Không tìm thấy học viên với thông tin trên. Vui lòng thêm học viên mới trước khi ghi danh!',
      });
    }
  };

  // Step 3: Confirm enrollment
  const handleConfirmEnrollment = () => {
    setNotification(null);

    if (!selectedStudent) {
      setNotification({ type: 'error', text: 'Vui lòng tìm và chọn học viên trước (Bước 1)!' });
      return;
    }

    if (!selectedClassId) {
      setNotification({ type: 'error', text: 'Vui lòng chọn lớp học còn chỗ (Bước 2)!' });
      return;
    }

    const res = createEnrollment(selectedStudent.MaHV, selectedClassId, loaiGhiDanh, ghiChu);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });

    if (res.success && res.maPhieu) {
      // Clear inputs for next registration
      setGhiChu('');
      setPreviewReceiptEnrollment(res.maPhieu);
    }
  };

  const handleCancelEnrollment = (maPhieu: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy phiếu ghi danh ${maPhieu}? Sĩ số lớp sẽ được giảm 1.`)) {
      const res = cancelEnrollment(maPhieu);
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    }
  };

  // Print modal representation for Enrollment Form (Phụ lục C.1)
  const previewedEnrollment = previewReceiptEnrollment
    ? enrollmentList.find(e => e.MaPhieuGhiDanh === previewReceiptEnrollment)
    : null;
  const previewedStudent = previewedEnrollment
    ? studentList.find(s => s.MaHV === previewedEnrollment.MaHV)
    : null;
  const previewedClass = previewedEnrollment
    ? classList.find(c => c.MaLop === previewedEnrollment.MaLop)
    : null;
  const previewedCourse = previewedClass
    ? courseList.find(c => c.MaKH === previewedClass.MaKH)
    : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardPenLine className="w-5 h-5 text-blue-700" />
            <span>Ghi danh và Xếp lớp</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Tiếp nhận đăng ký khóa học, tự động cập nhật sĩ số và sinh hóa đơn học phí
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Xem và truy vấn bảng PhieuGhiDanh trong CSDL SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server (PhieuGhiDanh)</span>
            </button>
          )}

          {!isReadOnly && (
            <button
              onClick={onOpenStudentTab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Tạo hồ sơ học viên mới</span>
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>Phân quyền Kế toán: Bạn có quyền xem danh sách phiếu ghi danh để phục vụ đối soát và thu học phí. Tiếp nhận ghi danh học viên mới do bộ phận Giáo vụ phụ trách.</span>
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

      {/* 3-Step Wizard Layout (Matching Hình 4.5) - Only for Admin & GiaoVu */}
      {!isReadOnly && (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
        {/* Step indicator header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <div className="text-xs font-bold">Bước 1: Tra cứu học viên</div>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <div className="text-xs font-bold">Bước 2: Chọn Khóa & Lớp học</div>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              3
            </span>
            <div className="text-xs font-bold">Bước 3: Chi tiết & Xác nhận</div>
          </div>
        </div>

        {/* 3 Columns Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Tim Hoc Vien */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Bước 1: Tìm Học viên</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nhập Số điện thoại hoặc Mã HV
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={phoneOrCodeSearch}
                  onChange={e => setPhoneOrCodeSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchStudent()}
                  placeholder="09xxxxxxxx hoặc HV001..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleSearchStudent}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Tìm
                </button>
              </div>
            </div>

            {selectedStudent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1 text-xs text-emerald-900">
                <div className="font-bold flex items-center justify-between">
                  <span>{selectedStudent.TenHV}</span>
                  <span className="font-mono text-emerald-700">{selectedStudent.MaHV}</span>
                </div>
                <div>SĐT: <span className="font-mono">{selectedStudent.SoDienThoai}</span></div>
                <div className="text-slate-600 text-[11px]">Email: {selectedStudent.Email || 'Chưa cập nhật'}</div>
                <div className="text-slate-600 text-[11px] truncate">
                  Địa chỉ: {selectedStudent.DiaChi || '—'}, {selectedStudent.ThanhPho}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                Chưa chọn học viên. Vui lòng nhập SĐT để tra cứu.
              </div>
            )}
          </div>

          {/* Column 2: Chon Khoa hoc & Lop */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <School className="w-4 h-4 text-blue-600" />
              <span>Bước 2: Chọn Lớp học</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Chọn khóa học
              </label>
              <select
                value={selectedCourseId}
                onChange={e => {
                  setSelectedCourseId(e.target.value);
                  setSelectedClassId('');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {courseList.map(c => (
                  <option key={c.MaKH} value={c.MaKH}>
                    {c.MaKH} - {c.TenKH} ({formatVND(c.HocPhi)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Chọn lớp đang chiêu sinh còn chỗ
              </label>
              {availableClasses.length === 0 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                  Hiện không có lớp nào đang chiêu sinh cho khóa này.
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Chọn lớp học --</option>
                  {availableClasses.map(cls => (
                    <option key={cls.MaLop} value={cls.MaLop}>
                      {cls.TenLop} (Sĩ số: {cls.SoLuongDaDangKy}/{cls.SucChuaToiDa} - KG:{' '}
                      {formatDate(cls.NgayKhaiGiang)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedClass && selectedCourse && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học phí gốc:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {formatVND(selectedCourse.HocPhi)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chỗ trống còn lại:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {selectedClass.SucChuaToiDa - selectedClass.SoLuongDaDangKy} học viên
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Chi tiet & Xac nhan */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Bước 3: Chi tiết & Xác nhận</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Loại ghi danh
              </label>
              <select
                value={loaiGhiDanh}
                onChange={e => setLoaiGhiDanh(e.target.value as 'ChinhThuc' | 'GiuCho')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ChinhThuc">Chính thức (Xác nhận nhập học)</option>
                <option value="GiuCho">Giữ chỗ (Tạm giữ vị trí)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ghi chú phiếu ghi danh
              </label>
              <input
                type="text"
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
                placeholder="Ghi chú thêm về yêu cầu lịch..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmEnrollment}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận ghi danh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Table: Danh sach phieu ghi danh gan day (Hình 4.5) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Danh sách phiếu ghi danh ({enrollmentList.length})
          </div>
          <div className="text-[11px] text-slate-400">
            Theo dõi sĩ số và chuyển nhanh sang thu học phí
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã phiếu</th>
                <th className="py-2.5 px-3">Học viên</th>
                <th className="py-2.5 px-3">SĐT</th>
                <th className="py-2.5 px-3">Lớp học</th>
                <th className="py-2.5 px-3">Khóa học</th>
                <th className="py-2.5 px-3">Ngày ghi danh</th>
                <th className="py-2.5 px-3 text-right">Học phí</th>
                <th className="py-2.5 px-3 text-center">Loại / Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enrollmentList.map(e => {
                const student = studentList.find(s => s.MaHV === e.MaHV);
                const cls = classList.find(c => c.MaLop === e.MaLop);
                const course = courseList.find(c => c.MaKH === cls?.MaKH);

                return (
                  <tr key={e.MaPhieuGhiDanh} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {e.MaPhieuGhiDanh}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {student?.TenHV || e.MaHV}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {student?.SoDienThoai || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-semibold">{cls?.TenLop || e.MaLop}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-[150px] truncate">
                      {course?.TenKH || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {e.NgayGhiDanh}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatVND(e.HocPhi)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          e.TrangThai === 'ChinhThuc'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : e.TrangThai === 'GiuCho'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {e.TrangThai}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptEnrollment(e.MaPhieuGhiDanh)}
                          title="Xem & in phiếu ghi danh"
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-700"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {e.TrangThai !== 'Huy' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onNavigateToPayment(e.MaPhieuGhiDanh)}
                              title="Thu học phí ngay"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Thu tiền</span>
                            </button>

                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleCancelEnrollment(e.MaPhieuGhiDanh)}
                                title="Hủy phiếu ghi danh"
                                className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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

      {/* Modal: Preview Phiếu Ghi Danh (Phụ lục C.1) */}
      {previewedEnrollment && previewedStudent && previewedClass && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="text-center border-b pb-3 border-slate-200">
              <div className="text-sm font-black text-emerald-900 tracking-wide uppercase">
                CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1 uppercase">
                PHIẾU GHI DANH
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Mã phiếu: <span className="font-mono font-bold text-slate-800">{previewedEnrollment.MaPhieuGhiDanh}</span> · Ngày: {previewedEnrollment.NgayGhiDanh}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Học viên:</span>
                <span className="font-bold text-slate-900">
                  {previewedStudent.TenHV} ({previewedStudent.MaHV})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-mono">{previewedStudent.SoDienThoai}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span>{previewedStudent.Email || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Khóa học:</span>
                <span className="font-semibold text-slate-900">{previewedCourse?.TenKH || previewedClass.MaKH}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lớp học:</span>
                <span>
                  {previewedClass.TenLop} (Sĩ số hiện tại: {previewedClass.SoLuongDaDangKy}/{previewedClass.SucChuaToiDa})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Học phí:</span>
                <span className="font-mono font-bold text-blue-700">
                  {formatVND(previewedEnrollment.HocPhi)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Loại ghi danh:</span>
                <span className="font-semibold">{previewedEnrollment.LoaiGhiDanh}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Người lập phiếu:</span>
                <span>{currentUser?.TenNV || 'Giáo vụ tuyển sinh'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewReceiptEnrollment(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Ghi Danh</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SQL Server Data Workbench Modal */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="PhieuGhiDanh"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
