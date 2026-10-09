import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DonBaoLuuChuyenLop } from '../types';
import { formatDate, formatVND } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  Building2,
  Calendar,
  Layers,
  ArrowRightLeft,
  PauseCircle,
  FileSpreadsheet,
  Terminal,
  Trash2,
  Ban,
} from 'lucide-react';

interface TransferDeferralManagerProps {
  initialType?: 'all' | 'ChuyenLop' | 'BaoLuu';
}

export const TransferDeferralManager: React.FC<TransferDeferralManagerProps> = ({ initialType = 'all' }) => {
  const {
    transferDeferralList,
    studentList,
    classList,
    courseList,
    enrollmentList,
    currentUser,
    submitTransferOrDeferral,
    approveTransferOrDeferral,
    rejectTransferOrDeferral,
    deleteTransferOrDeferral,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'ChuyenLop' | 'BaoLuu'>(initialType);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ChoDuyet' | 'DaDuyet' | 'TuChoi'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);
  const [deleteConfirmDon, setDeleteConfirmDon] = useState<DonBaoLuuChuyenLop | null>(null);

  // Sync initialType if prop changes
  React.useEffect(() => {
    if (initialType) {
      setActiveFilter(initialType);
      if (initialType !== 'all') {
        setFormType(initialType);
      }
    }
  }, [initialType]);

  // Modal create request
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formType, setFormType] = useState<'ChuyenLop' | 'BaoLuu'>('ChuyenLop');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedOldClassId, setSelectedOldClassId] = useState('');
  const [selectedNewClassId, setSelectedNewClassId] = useState('');
  const [reason, setReason] = useState('');
  const [deferralStart, setDeferralStart] = useState('');
  const [deferralEnd, setDeferralEnd] = useState('');

  // Decision preview modal
  const [previewDoc, setPreviewDoc] = useState<DonBaoLuuChuyenLop | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered requests
  const filteredList = transferDeferralList.filter(item => {
    if (activeFilter !== 'all' && item.LoaiDon !== activeFilter) return false;
    if (statusFilter !== 'all' && item.TrangThai !== statusFilter) return false;

    const student = studentList.find(s => s.MaHV === item.MaHV);
    const searchLower = searchTerm.toLowerCase();

    const matchCode = item.MaDon.toLowerCase().includes(searchLower);
    const matchStudent =
      student &&
      (student.TenHV.toLowerCase().includes(searchLower) ||
        student.SoDienThoai.includes(searchTerm) ||
        student.MaHV.toLowerCase().includes(searchLower));

    return matchCode || matchStudent;
  });

  // Calculate tuition difference when selecting new class
  const oldClass = classList.find(c => c.MaLop === selectedOldClassId);
  const oldCourse = oldClass ? courseList.find(c => c.MaKH === oldClass.MaKH) : null;
  const newClass = classList.find(c => c.MaLop === selectedNewClassId);
  const newCourse = newClass ? courseList.find(c => c.MaKH === newClass.MaKH) : null;

  const tuitionDiff =
    formType === 'ChuyenLop' && oldCourse && newCourse ? Math.max(0, newCourse.HocPhi - oldCourse.HocPhi) : 0;

  // Student's active enrolled classes
  const studentEnrollments = enrollmentList.filter(
    e => e.MaHV === selectedStudentId && e.TrangThai === 'ChinhThuc'
  );

  // Available new classes for transfer (different from current, has capacity)
  const availableTargetClasses = classList.filter(
    c => c.MaLop !== selectedOldClassId && c.TrangThai !== 'DaKetThuc'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!selectedStudentId) {
      setNotification({ type: 'error', text: 'Vui lòng chọn học viên nộp đơn!' });
      return;
    }
    if (!selectedOldClassId) {
      setNotification({ type: 'error', text: 'Vui lòng chọn lớp học đang theo học!' });
      return;
    }
    if (formType === 'ChuyenLop') {
      if (!selectedNewClassId) {
        setNotification({ type: 'error', text: 'Vui lòng chọn lớp học chuyển đến!' });
        return;
      }
      if (selectedOldClassId === selectedNewClassId) {
        setNotification({ type: 'error', text: 'Lớp chuyển đến phải khác lớp hiện tại!' });
        return;
      }
    } else {
      if (!deferralStart || !deferralEnd) {
        setNotification({ type: 'error', text: 'Vui lòng chọn thời gian bắt đầu và kết thúc bảo lưu!' });
        return;
      }
    }
    if (!reason.trim()) {
      setNotification({ type: 'error', text: 'Vui lòng ghi rõ lý do bảo lưu / chuyển lớp!' });
      return;
    }

    const res = submitTransferOrDeferral({
      LoaiDon: formType,
      MaHV: selectedStudentId,
      MaLopCu: selectedOldClassId,
      MaLopMoi: formType === 'ChuyenLop' ? selectedNewClassId : undefined,
      LyDo: reason.trim(),
      NgayBatDauBaoLuu: formType === 'BaoLuu' ? deferralStart : undefined,
      NgayKetThucBaoLuu: formType === 'BaoLuu' ? deferralEnd : undefined,
      ChenhLechHocPhi: tuitionDiff,
    });

    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setShowCreateModal(false);
      // Reset
      setSelectedStudentId('');
      setSelectedOldClassId('');
      setSelectedNewClassId('');
      setReason('');
      setDeferralStart('');
      setDeferralEnd('');
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const handleApprove = (maDon: string) => {
    const res = approveTransferOrDeferral(maDon);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            Quản lý Bảo lưu & Chuyển lớp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình tiếp nhận, xét duyệt thay đổi lộ trình học và bảo lưu học phí theo quy chế đào tạo
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng DonBaoLuuChuyenLop trong SQL Server"
            >
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormType('ChuyenLop');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lập Đơn Chuyển Lớp / Bảo Lưu
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-xs border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng số yêu cầu</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{transferDeferralList.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đơn bảo lưu & chuyển lớp</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600">Chờ phê duyệt</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {transferDeferralList.filter(d => d.TrangThai === 'ChoDuyet').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cần Ban Quản lý ký duyệt</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600">Chuyển lớp thành công</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {transferDeferralList.filter(d => d.LoaiDon === 'ChuyenLop' && d.TrangThai === 'DaDuyet').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã cập nhật sĩ số lớp mới</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600">Đang bảo lưu khóa</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {transferDeferralList.filter(d => d.LoaiDon === 'BaoLuu' && d.TrangThai === 'DaDuyet').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bảo toàn học phí hợp lệ</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'all' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả loại ({transferDeferralList.length})
            </button>
            <button
              onClick={() => setActiveFilter('ChuyenLop')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'ChuyenLop'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chuyển lớp ({transferDeferralList.filter(d => d.LoaiDon === 'ChuyenLop').length})
            </button>
            <button
              onClick={() => setActiveFilter('BaoLuu')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'BaoLuu'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bảo lưu ({transferDeferralList.filter(d => d.LoaiDon === 'BaoLuu').length})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ChoDuyet">Chờ duyệt</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="TuChoi">Từ chối</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, mã/tên HV, SĐT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Loại đơn</th>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Lớp hiện tại / Chuyển đến</th>
                <th className="px-4 py-3">Lý do & Thời hạn</th>
                <th className="px-4 py-3 text-right">Chênh lệch HP</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy yêu cầu bảo lưu hoặc chuyển lớp nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const student = studentList.find(s => s.MaHV === item.MaHV);
                  const oldCls = classList.find(c => c.MaLop === item.MaLopCu);
                  const newCls = item.MaLopMoi ? classList.find(c => c.MaLop === item.MaLopMoi) : null;

                  return (
                    <tr key={item.MaDon} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.MaDon}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.LoaiDon === 'ChuyenLop'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.LoaiDon === 'ChuyenLop' ? (
                            <ArrowRightLeft className="w-3 h-3" />
                          ) : (
                            <PauseCircle className="w-3 h-3" />
                          )}
                          {item.LoaiDon === 'ChuyenLop' ? 'Chuyển lớp' : 'Bảo lưu'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{student?.TenHV || item.MaHV}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.MaHV} · {student?.SoDienThoai || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-700">
                            <span className="text-[10px] text-slate-400">Từ:</span>
                            <span className="font-semibold">{item.MaLopCu}</span>
                            <span className="text-[11px] text-slate-500">({oldCls?.TenLop || 'Lớp cũ'})</span>
                          </div>
                          {item.LoaiDon === 'ChuyenLop' && (
                            <div className="flex items-center gap-1 text-blue-700">
                              <span className="text-[10px] text-slate-400">Đến:</span>
                              <span className="font-semibold">{item.MaLopMoi}</span>
                              <span className="text-[11px]">({newCls?.TenLop || 'Lớp mới'})</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-slate-800 truncate" title={item.LyDo}>
                          {item.LyDo}
                        </div>
                        {item.LoaiDon === 'BaoLuu' && item.NgayBatDauBaoLuu && item.NgayKetThucBaoLuu && (
                          <div className="text-[11px] text-purple-700 font-medium mt-0.5">
                            Thời hạn: {formatDate(item.NgayBatDauBaoLuu)} → {formatDate(item.NgayKetThucBaoLuu)}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">Nộp ngày: {formatDate(item.NgayNopDon)}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {item.ChenhLechHocPhi > 0 ? (
                          <span className="text-amber-600">+{formatVND(item.ChenhLechHocPhi)}</span>
                        ) : (
                          <span className="text-slate-400">0 ₫</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            item.TrangThai === 'DaDuyet'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.TrangThai === 'ChoDuyet'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.TrangThai === 'DaDuyet'
                            ? 'Đã phê duyệt'
                            : item.TrangThai === 'ChoDuyet'
                            ? 'Chờ duyệt'
                            : 'Từ chối'}
                        </span>
                        {item.NguoiDuyet && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.NguoiDuyet}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center space-x-1 whitespace-nowrap">
                        {item.TrangThai === 'ChoDuyet' &&
                          (currentUser?.VaiTro === 'Admin' || currentUser?.VaiTro === 'GiaoVu') && (
                            <>
                              <button
                                onClick={() => handleApprove(item.MaDon)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => {
                                  const res = rejectTransferOrDeferral(item.MaDon);
                                  setNotification({ type: res.success ? 'success' : 'error', text: res.message });
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        <button
                          onClick={() => setPreviewDoc(item)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          title="Xem Quyết định & In ấn"
                        >
                          <Printer className="w-3.5 h-3.5 inline mr-1" />
                          In QĐ
                        </button>
                        <button
                          onClick={() => setDeleteConfirmDon(item)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Xóa đơn này"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
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

      {/* MODAL: CREATE NEW TRANSFER OR DEFERRAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Tiếp nhận Đơn Bảo lưu / Chuyển lớp
                </h3>
                <div className="text-xs text-slate-300">
                  KIẾN TRẺ - Phân hệ Quản lý Đào tạo & Học vụ
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Request Type Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Loại yêu cầu *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('ChuyenLop')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all ${
                      formType === 'ChuyenLop'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Chuyển lớp học
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('BaoLuu')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all ${
                      formType === 'BaoLuu'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PauseCircle className="w-4 h-4" />
                    Bảo lưu khóa học
                  </button>
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn Học viên *</label>
                <select
                  value={selectedStudentId}
                  onChange={e => {
                    setSelectedStudentId(e.target.value);
                    setSelectedOldClassId('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">-- Chọn học viên có nhu cầu --</option>
                  {studentList.map((s, idx) => (
                    <option key={`${s.MaHV}-${idx}`} value={s.MaHV}>
                      {s.MaHV} - {s.TenHV} ({s.SoDienThoai})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Class */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lớp học hiện tại *</label>
                <select
                  value={selectedOldClassId}
                  onChange={e => setSelectedOldClassId(e.target.value)}
                  disabled={!selectedStudentId}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  required
                >
                  <option value="">-- Chọn lớp đang tham gia học --</option>
                  {studentEnrollments.length > 0
                    ? studentEnrollments.map(e => {
                        const cls = classList.find(c => c.MaLop === e.MaLop);
                        return (
                          <option key={e.MaPhieuGhiDanh} value={e.MaLop}>
                            {e.MaLop} - {cls?.TenLop || 'Lớp học'} (Đã đăng ký)
                          </option>
                        );
                      })
                    : classList.map(c => (
                        <option key={c.MaLop} value={c.MaLop}>
                          {c.MaLop} - {c.TenLop}
                        </option>
                      ))}
                </select>
              </div>

              {/* Destination Class (If Transfer) */}
              {formType === 'ChuyenLop' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lớp học muốn chuyển đến *
                  </label>
                  <select
                    value={selectedNewClassId}
                    onChange={e => setSelectedNewClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn lớp tiếp nhận học viên --</option>
                    {availableTargetClasses.map(c => (
                      <option key={c.MaLop} value={c.MaLop}>
                        {c.MaLop} - {c.TenLop} (Sĩ số: {c.SoLuongDaDangKy}/{c.SucChuaToiDa})
                      </option>
                    ))}
                  </select>

                  {tuitionDiff > 0 && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                      <strong>Lưu ý học phí:</strong> Lớp mới có học phí cao hơn lớp cũ. Học viên cần nộp bổ sung{' '}
                      <span className="font-bold text-amber-900">{formatVND(tuitionDiff)}</span> khi hoàn tất thủ
                      tục.
                    </div>
                  )}
                </div>
              ) : (
                /* Deferral Dates (If Deferral) */
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu bảo lưu *</label>
                    <input
                      type="date"
                      value={deferralStart}
                      onChange={e => setDeferralStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ngày kết thúc bảo lưu *</label>
                    <input
                      type="date"
                      value={deferralEnd}
                      onChange={e => setDeferralEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý do chi tiết *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ghi rõ lý do thay đổi lịch công tác, lịch thi đại học, việc gia đình..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Xác nhận Nộp đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DECISION NOTICE (IN QUYẾT ĐỊNH) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden my-6">
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="font-bold text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                Văn bản Quyết định Chính thức - KIẾN TRẺ EDU
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  In / Lưu PDF
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-8 text-slate-900 font-sans leading-relaxed text-xs space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                <div>
                  <div className="font-bold uppercase text-[11px] text-emerald-900">
                    CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
                  </div>
                  <div className="text-[10px] text-slate-600">Phòng Đào tạo & Quản lý Học vụ</div>
                  <div className="text-[10px] text-slate-500 font-mono">Số: {previewDoc.MaDon}/QĐ-KIENTRE</div>
                </div>
                <div className="text-right">
                  <div className="font-bold uppercase text-[10px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm{' '}
                    {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-2 pb-1">
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  {previewDoc.LoaiDon === 'ChuyenLop'
                    ? 'QUYẾT ĐỊNH VỀ VIỆC ĐIỀU CHUYỂN LỚP HỌC'
                    : 'QUYẾT ĐỊNH VỀ VIỆC BẢO LƯU KẾT QUẢ VÀ HỌC PHÍ'}
                </h2>
                <div className="text-[11px] italic text-slate-600">
                  (Căn cứ theo Quy chế Đào tạo và Quản lý Học viên của Công ty Cổ phần Đầu tư Giáo dục KIẾN TRẺ)
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2 text-justify">
                <p>
                  <strong>GIÁM ĐỐC ĐIỀU HÀNH KIẾN TRẺ EDUCATION</strong>
                </p>
                <p className="italic text-[11px] text-slate-600">
                  - Căn cứ chức năng, quyền hạn của Ban Giám đốc và Phòng Đào tạo;
                  <br />
                  - Căn cứ Đơn đề nghị của học viên nộp ngày {formatDate(previewDoc.NgayNopDon)};
                  <br />- Xét khả năng tiếp nhận và sĩ số lớp học của các chi nhánh.
                </p>

                <p className="text-center font-bold text-slate-900 pt-1">QUYẾT ĐỊNH:</p>

                <div className="space-y-1.5 pl-2">
                  <p>
                    <strong>Điều 1.</strong> Chấp thuận cho học viên có thông tin sau:
                  </p>
                  {(() => {
                    const st = studentList.find(s => s.MaHV === previewDoc.MaHV);
                    const oldC = classList.find(c => c.MaLop === previewDoc.MaLopCu);
                    const newC = previewDoc.MaLopMoi ? classList.find(c => c.MaLop === previewDoc.MaLopMoi) : null;

                    return (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div>
                          • Họ và tên học viên: <strong>{st?.TenHV || previewDoc.MaHV}</strong> (Mã HV:{' '}
                          <span className="font-mono">{previewDoc.MaHV}</span>)
                        </div>
                        <div>• Số điện thoại liên lạc: {st?.SoDienThoai || 'N/A'}</div>
                        <div>
                          • Lớp học chuyển đi / bảo lưu: <strong>{previewDoc.MaLopCu}</strong> -{' '}
                          {oldC?.TenLop || 'N/A'}
                        </div>
                        {previewDoc.LoaiDon === 'ChuyenLop' ? (
                          <div>
                            • Lớp học tiếp nhận chuyển đến:{' '}
                            <strong className="text-blue-700">{previewDoc.MaLopMoi}</strong> -{' '}
                            {newC?.TenLop || 'N/A'}
                          </div>
                        ) : (
                          <div>
                            • Thời hạn bảo lưu:{' '}
                            <strong>
                              Từ {formatDate(previewDoc.NgayBatDauBaoLuu || '')} đến{' '}
                              {formatDate(previewDoc.NgayKetThucBaoLuu || '')}
                            </strong>
                          </div>
                        )}
                        <div>• Lý do: {previewDoc.LyDo}</div>
                      </div>
                    );
                  })()}

                  <p>
                    <strong>Điều 2.</strong> Về trách nhiệm tài chính và giáo vụ:
                  </p>
                  <p className="pl-3 text-[11px] text-slate-700">
                    Học viên được bảo lưu nguyên vẹn kết quả học tập và số tiền học phí đã nộp. Khoản chênh lệch
                    học phí (nếu có):{' '}
                    <strong>{previewDoc.ChenhLechHocPhi > 0 ? formatVND(previewDoc.ChenhLechHocPhi) : '0 VNĐ'}</strong>.
                  </p>

                  <p>
                    <strong>Điều 3.</strong> Các phòng ban Giao vụ, Kế toán, Giảng viên phụ trách và học viên có tên
                    tại Điều 1 chịu trách nhiệm thi hành quyết định này.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 pb-4 text-center">
                <div>
                  <div className="font-bold uppercase text-[11px]">HỌC VIÊN LÀM ĐƠN</div>
                  <div className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-semibold text-slate-700">
                    {studentList.find(s => s.MaHV === previewDoc.MaHV)?.TenHV || 'Học viên'}
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase text-[11px]">TM. BAN GIÁM ĐỐC TRUNG TÂM</div>
                  <div className="text-[10px] italic text-slate-500">(Ký tên và đóng dấu)</div>
                  <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                    {previewDoc.NguoiDuyet || 'TS. Lâm Hoàng Trúc Mai'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDon && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa hồ sơ</h3>
            </div>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa vĩnh viễn đơn{' '}
              <span className="font-semibold text-slate-900 font-mono">[{deleteConfirmDon.MaDon}]</span> (
              {deleteConfirmDon.LoaiDon === 'ChuyenLop' ? 'Chuyển lớp' : 'Bảo lưu'}) của học viên{' '}
              <span className="font-semibold text-slate-900">
                {studentList.find(s => s.MaHV === deleteConfirmDon.MaHV)?.TenHV || deleteConfirmDon.MaHV}
              </span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmDon(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = deleteTransferOrDeferral(deleteConfirmDon.MaDon);
                  setNotification({ type: res.success ? 'success' : 'error', text: res.message });
                  setDeleteConfirmDon(null);
                }}
                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
              >
                Xóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="DonBaoLuuChuyenLop"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
