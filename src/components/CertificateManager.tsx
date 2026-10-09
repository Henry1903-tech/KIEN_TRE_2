import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChungChi } from '../types';
import { formatDate } from '../utils/formatters';
import { KienTreLogo } from './KienTreLogo';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  Award,
  Search,
  Printer,
  CheckCircle2,
  GraduationCap,
  Calendar,
  X,
  FileCheck,
  Plus,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
  Terminal,
  Building2,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const CertificateManager: React.FC = () => {
  const {
    certificateList,
    studentList,
    classList,
    courseList,
    gradeList,
    enrollmentList,
    issueCertificate,
    updateCertificate,
    deleteCertificate,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterRank, setFilterRank] = useState('ALL');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  // Active certificate being previewed/printed
  const [previewCert, setPreviewCert] = useState<ChungChi | null>(null);

  // Edit certificate state
  const [editingCert, setEditingCert] = useState<ChungChi | null>(null);
  const [deleteConfirmCert, setDeleteConfirmCert] = useState<ChungChi | null>(null);

  // Modal to issue new certificate
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueSelectedClass, setIssueSelectedClass] = useState(classList[0]?.MaLop || '');
  const [issueNotification, setIssueNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered list
  const filteredCertificates = certificateList.filter(cert => {
    if (filterClass !== 'ALL' && cert.MaLop !== filterClass) return false;
    if (filterRank !== 'ALL' && cert.XepLoai !== filterRank) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const student = studentList.find(s => s.MaHV === cert.MaHV);
      const matchCertId = cert.MaChungChi.toLowerCase().includes(term);
      const matchSoHieu = cert.SoHieu.toLowerCase().includes(term);
      const matchStudentName = student && student.TenHV.toLowerCase().includes(term);
      const matchStudentCode = cert.MaHV.toLowerCase().includes(term);
      return matchCertId || matchSoHieu || matchStudentName || matchStudentCode;
    }

    return true;
  });

  // Students eligible for new certificate in selected class
  const eligibleStudents = enrollmentList
    .filter(e => e.MaLop === issueSelectedClass && e.TrangThai !== 'Huy')
    .map(e => {
      const student = studentList.find(s => s.MaHV === e.MaHV);
      const grade = gradeList.find(g => g.MaHV === e.MaHV && g.MaLop === issueSelectedClass);
      const alreadyIssued = certificateList.some(c => c.MaHV === e.MaHV && c.MaLop === issueSelectedClass);
      return {
        maHV: e.MaHV,
        studentName: student?.TenHV || 'Học viên',
        phone: student?.SoDienThoai || '',
        grade,
        passed: grade?.TrangThaiQuaMon ?? false,
        score: grade?.DiemTongKet ?? 0,
        rank: grade?.XepLoai ?? 'Chưa đánh giá',
        alreadyIssued,
      };
    });

  const handleIssueSingle = (maHV: string) => {
    setIssueNotification(null);
    const res = issueCertificate(maHV, issueSelectedClass);
    if (res.success) {
      setIssueNotification({ type: 'success', text: res.message });
      if (res.maChungChi) {
        const newlyIssued = certificateList.find(c => c.MaChungChi === res.maChungChi);
        if (newlyIssued) setPreviewCert(newlyIssued);
      }
    } else {
      setIssueNotification({ type: 'error', text: res.message });
    }
  };

  const handleSaveEditCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    const res = updateCertificate(editingCert);
    if (res.success) {
      setEditingCert(null);
    }
  };

  const handleConfirmDeleteCert = () => {
    if (!deleteConfirmCert) return;
    const res = deleteCertificate(deleteConfirmCert.MaChungChi);
    if (res.success) {
      if (previewCert?.MaChungChi === deleteConfirmCert.MaChungChi) setPreviewCert(null);
    }
    setDeleteConfirmCert(null);
  };

  // Rank counts
  const excellentCount = certificateList.filter(c => c.XepLoai === 'Xuất sắc').length;
  const goodCount = certificateList.filter(c => c.XepLoai === 'Giỏi').length;
  const fairCount = certificateList.filter(c => c.XepLoai === 'Khá').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-700" />
            <span>Quản lý & Cấp phát Chứng chỉ Tốt nghiệp</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấp văn bằng chứng chỉ hoàn thành khóa đào tạo, số hiệu văn bằng lưu trữ và in ấn theo chuẩn quy định
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server (ChungChi)</span>
            </button>
          )}

          {(currentUser?.VaiTro === 'Admin' || currentUser?.VaiTro === 'GiaoVu') && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Xét cấp chứng chỉ mới</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng chứng chỉ đã cấp</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{certificateList.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã lưu trữ số hiệu văn bằng</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-700">Tốt nghiệp Xuất sắc</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{excellentCount}</div>
          <div className="text-[11px] text-purple-600 mt-1">Điểm tổng kết &ge; 9.0</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Tốt nghiệp Giỏi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{goodCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Điểm tổng kết 8.0 - 8.9</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-700">Tốt nghiệp Khá</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{fairCount}</div>
          <div className="text-[11px] text-blue-600 mt-1">Điểm tổng kết 6.5 - 7.9</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">-- Tất cả lớp học --</option>
            {classList.map(c => (
              <option key={c.MaLop} value={c.MaLop}>
                {c.TenLop} ({c.MaLop})
              </option>
            ))}
          </select>

          {/* Rank Filter */}
          <select
            value={filterRank}
            onChange={e => setFilterRank(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">-- Tất cả xếp loại --</option>
            <option value="Xuất sắc">Xuất sắc</option>
            <option value="Giỏi">Giỏi</option>
            <option value="Khá">Khá</option>
            <option value="Trung bình">Trung bình</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tra cứu số hiệu, mã chứng chỉ, tên HV..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Certificate Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Mã chứng chỉ</th>
                <th className="px-4 py-3">Số hiệu văn bằng</th>
                <th className="px-4 py-3">Học viên tốt nghiệp</th>
                <th className="px-4 py-3">Tên chứng chỉ & Khóa đào tạo</th>
                <th className="px-4 py-3 text-center">Xếp loại</th>
                <th className="px-4 py-3 text-center">Ngày cấp</th>
                <th className="px-4 py-3 text-right">In ấn & Xem mẫu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy chứng chỉ nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map(cert => {
                  const student = studentList.find(s => s.MaHV === cert.MaHV);
                  const cls = classList.find(c => c.MaLop === cert.MaLop);

                  return (
                    <tr key={cert.MaChungChi} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {cert.MaChungChi}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                        {cert.SoHieu}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{student?.TenHV || cert.MaHV}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Mã HV: {cert.MaHV} · {student?.SoDienThoai}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{cert.TenChungChi}</div>
                        <div className="text-[11px] text-slate-500">Lớp: {cls?.TenLop || cert.MaLop}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cert.XepLoai === 'Xuất sắc'
                              ? 'bg-purple-100 text-purple-800'
                              : cert.XepLoai === 'Giỏi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cert.XepLoai === 'Khá'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cert.XepLoai}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 font-medium">
                        {formatDate(cert.NgayCap)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewCert(cert)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                            title="Xem & in chứng chỉ tốt nghiệp"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>In bằng</span>
                          </button>

                          <button
                            onClick={() => setEditingCert(cert)}
                            className="p-1 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded transition cursor-pointer"
                            title="Chỉnh sửa thông tin chứng chỉ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmCert(cert)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="Thu hồi / Xóa chứng chỉ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: XÉT CẤP CHỨNG CHỈ MỚI */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Xét cấp chứng chỉ tốt nghiệp cho học viên
                </h3>
                <div className="text-xs text-slate-400">Kiểm tra điều kiện qua môn (&ge; 5.0) và cấp văn bằng</div>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {issueNotification && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 border ${
                    issueNotification.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{issueNotification.text}</span>
                </div>
              )}

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700 whitespace-nowrap">Chọn Lớp học xét cấp:</label>
                <select
                  value={issueSelectedClass}
                  onChange={e => setIssueSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  {classList.map(cls => (
                    <option key={cls.MaLop} value={cls.MaLop}>
                      {cls.TenLop} ({cls.MaLop})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student eligible table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 sticky top-0 text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Mã HV</th>
                      <th className="px-3 py-2">Họ và tên</th>
                      <th className="px-3 py-2 text-center">Điểm TK</th>
                      <th className="px-3 py-2 text-center">Xếp loại</th>
                      <th className="px-3 py-2 text-right">Trạng thái cấp bằng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibleStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                          Chưa có học viên nào đăng ký lớp học này.
                        </td>
                      </tr>
                    ) : (
                      eligibleStudents.map((st, idx) => (
                        <tr key={`${st.maHV}-${idx}`} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold text-blue-700">{st.maHV}</td>
                          <td className="px-3 py-2 font-semibold text-slate-800">{st.studentName}</td>
                          <td className="px-3 py-2 text-center font-bold">
                            <span className={st.passed ? 'text-emerald-700' : 'text-rose-600'}>
                              {st.score ? st.score.toFixed(1) : '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="text-[10px] font-bold text-slate-600">{st.rank}</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {st.alreadyIssued ? (
                              <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Đã cấp bằng
                              </span>
                            ) : st.passed ? (
                              <button
                                onClick={() => handleIssueSingle(st.maHV)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold shadow-xs"
                              >
                                Cấp chứng chỉ ngay
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                Chưa đủ điểm tốt nghiệp
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHỨNG CHỈ TỐT NGHIỆP PHÔI CAO CẤP */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-4 border-amber-600/30 relative text-slate-900 my-8">
            {/* Background Golden Borders */}
            <div className="absolute inset-4 border-2 border-amber-700/20 rounded-xl pointer-events-none p-2 flex flex-col justify-between">
              <div className="flex justify-between text-amber-600 text-sm">✦ ✦ ✦</div>
              <div className="flex justify-between text-amber-600 text-sm">✦ ✦ ✦</div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center relative z-10 space-y-2">
              <div className="text-xs font-black tracking-widest text-blue-900 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Độc lập – Tự do – Hạnh phúc
              </div>
              <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-1 mb-4" />

              <div className="flex items-center justify-center gap-3">
                <KienTreLogo size="md" variant="horizontal" />
              </div>

              <h2 className="text-2xl font-black text-amber-800 tracking-wide uppercase mt-4">
                CHỨNG CHỈ TỐT NGHIỆP
              </h2>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                CERTIFICATE OF COMPLETION
              </div>
            </div>

            {/* Certificate Body */}
            <div className="relative z-10 text-center space-y-3 my-6 text-sm text-slate-800">
              <p className="text-xs text-slate-500 italic">Chứng nhận học viên:</p>
              <h3 className="text-xl font-extrabold text-blue-900 tracking-wide">
                {studentList.find(s => s.MaHV === previewCert.MaHV)?.TenHV || 'HỌC VIÊN'}
              </h3>
              <p className="text-xs text-slate-600">
                Mã số học viên: <span className="font-mono font-bold">{previewCert.MaHV}</span>
              </p>

              <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed pt-2">
                Đã hoàn thành xuất sắc chương trình đào tạo và đạt đầy đủ các tiêu chuẩn kiểm định chất lượng:
              </p>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 inline-block font-bold text-amber-950 text-sm">
                {previewCert.TenChungChi}
              </div>

              <div className="flex justify-center items-center gap-8 text-xs pt-2">
                <div>
                  Xếp loại tốt nghiệp: <span className="font-bold text-emerald-800">{previewCert.XepLoai}</span>
                </div>
                <div>
                  Số hiệu văn bằng: <span className="font-mono font-bold text-slate-800">{previewCert.SoHieu}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="relative z-10 grid grid-cols-2 text-center text-xs pt-6 border-t border-slate-200 mt-6">
              <div>
                <div className="font-bold text-slate-800">HỘI ĐỒNG KHẢO THÍ</div>
                <div className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</div>
                <div className="h-16 flex items-center justify-center text-slate-300">✦ ✦ ✦</div>
                <div className="font-bold text-slate-900">TS. Lâm Hoàng Trúc Mai</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500">TP. Hồ Chí Minh, ngày {previewCert.NgayCap}</div>
                <div className="font-bold text-slate-800 mt-1">GIÁM ĐỐC TRUNG TÂM</div>
                <div className="text-[11px] text-slate-400 italic">(Ký tên và đóng dấu)</div>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-rose-600 font-bold border-2 border-rose-600 border-dashed rounded px-2 py-0.5 rotate-[-6deg] uppercase">
                    Đã công chứng · KIẾN TRẺ
                  </span>
                </div>
                <div className="font-bold text-slate-900">Lý Quang Nghĩa</div>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6 no-print">
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>In Chứng Chỉ (A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Certificate Modal */}
      {editingCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Chỉnh sửa chứng chỉ ({editingCert.MaChungChi})</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCert} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên văn bằng chứng chỉ *</label>
                <input
                  type="text"
                  required
                  value={editingCert.TenChungChi}
                  onChange={e => setEditingCert({ ...editingCert, TenChungChi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số hiệu văn bằng *</label>
                <input
                  type="text"
                  required
                  value={editingCert.SoHieu}
                  onChange={e => setEditingCert({ ...editingCert, SoHieu: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Xếp loại tốt nghiệp</label>
                  <select
                    value={editingCert.XepLoai}
                    onChange={e => setEditingCert({ ...editingCert, XepLoai: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Xuất sắc">Xuất sắc</option>
                    <option value="Giỏi">Giỏi</option>
                    <option value="Khá">Khá</option>
                    <option value="Trung bình">Trung bình</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày cấp chứng chỉ</label>
                  <input
                    type="date"
                    required
                    value={editingCert.NgayCap}
                    onChange={e => setEditingCert({ ...editingCert, NgayCap: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Certificate Confirmation Modal */}
      {deleteConfirmCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Thu hồi & Xóa chứng chỉ tốt nghiệp</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn thu hồi chứng chỉ <b>{deleteConfirmCert.MaChungChi}</b> (Số hiệu: {deleteConfirmCert.SoHieu})?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmCert(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCert}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Thu hồi & Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Workbench */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="ChungChi"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
