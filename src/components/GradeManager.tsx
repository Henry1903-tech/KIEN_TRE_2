import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiemSo, ChungChi } from '../types';
import { formatDate } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import { KienTreLogo } from './KienTreLogo';
import {
  Award,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileCheck,
  Download,
  X,
  GraduationCap,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const GradeManager: React.FC = () => {
  const { classList, studentList, enrollmentList, courseList, gradeList, certificateList, saveGrade, issueCertificate, currentUser } = useApp();

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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  // Active preview certificate modal
  const [previewCert, setPreviewCert] = useState<ChungChi | null>(null);

  // Temporary editing grade table state
  const [gradesMap, setGradesMap] = useState<
    Record<
      string,
      {
        chuyenCan: number;
        giuaKy: number;
        cuoiKy: number;
        nhanXet: string;
      }
    >
  >({});

  const enrolledStudents = enrollmentList
    .filter(e => e.MaLop === selectedClassId && e.TrangThai !== 'Huy')
    .map(e => {
      const student = studentList.find(s => s.MaHV === e.MaHV);
      return {
        maHV: e.MaHV,
        tenHV: student?.TenHV || 'Học viên',
        soDienThoai: student?.SoDienThoai || '—',
      };
    });

  // Load existing grades into state
  React.useEffect(() => {
    const map: Record<string, { chuyenCan: number; giuaKy: number; cuoiKy: number; nhanXet: string }> = {};

    enrolledStudents.forEach(st => {
      const found = gradeList.find(g => g.MaLop === selectedClassId && g.MaHV === st.maHV);
      if (found) {
        map[st.maHV] = {
          chuyenCan: found.DiemChuyenCan,
          giuaKy: found.DiemGiuaKy,
          cuoiKy: found.DiemCuoiKy,
          nhanXet: found.NhanXet || '',
        };
      } else {
        map[st.maHV] = {
          chuyenCan: 9.0,
          giuaKy: 8.0,
          cuoiKy: 8.5,
          nhanXet: 'Học viên tham gia học tập tích cực',
        };
      }
    });

    setGradesMap(map);
  }, [selectedClassId, enrolledStudents.length]);

  const handleUpdateStudentGrade = (
    maHV: string,
    field: 'chuyenCan' | 'giuaKy' | 'cuoiKy' | 'nhanXet',
    value: any
  ) => {
    setGradesMap(prev => ({
      ...prev,
      [maHV]: {
        ...prev[maHV],
        [field]: value,
      },
    }));
  };

  const handleSaveStudentGrade = (maHV: string) => {
    setNotification(null);
    const data = gradesMap[maHV];
    if (!data) return;

    if (data.chuyenCan < 0 || data.chuyenCan > 10 || data.giuaKy < 0 || data.giuaKy > 10 || data.cuoiKy < 0 || data.cuoiKy > 10) {
      setNotification({ type: 'error', text: 'Điểm số phải nằm trong thang điểm từ 0 đến 10!' });
      return;
    }

    const res = saveGrade({
      MaHV: maHV,
      MaLop: selectedClassId,
      DiemChuyenCan: Number(data.chuyenCan),
      DiemGiuaKy: Number(data.giuaKy),
      DiemCuoiKy: Number(data.cuoiKy),
      NgayDanhGia: new Date().toISOString().slice(0, 10),
      NhanXet: data.nhanXet,
    });

    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleIssueCert = (maHV: string) => {
    const res = issueCertificate(maHV, selectedClassId);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });

    if (res.success && res.maChungChi) {
      const cert = certificateList.find(c => c.MaChungChi === res.maChungChi) || {
        MaChungChi: res.maChungChi,
        MaHV: maHV,
        MaLop: selectedClassId,
        TenChungChi: 'CHỨNG CHỈ TỐT NGHIỆP KHÓA HỌC CHUYÊN NGHIỆP',
        NgayCap: new Date().toISOString().slice(0, 10),
        XepLoai: 'Giỏi',
        SoHieu: `KTE-EDU-2026-${Math.floor(100 + Math.random() * 900)}`,
      };
      setPreviewCert(cert);
    }
  };

  const selectedClass = classList.find(c => c.MaLop === selectedClassId);
  const selectedCourse = selectedClass ? courseList.find(c => c.MaKH === selectedClass.MaKH) : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-700" />
            <span>Quản lý Đào tạo · Bảng điểm & Chứng chỉ Tốt nghiệp</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Đánh giá năng lực học viên theo công thức 10% Chuyên cần + 30% Giữa kỳ + 60% Cuối kỳ tại KIẾN TRẺ EDU
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Xem và truy vấn bảng DiemSo & ChungChi trong CSDL SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server (DiemSo)</span>
            </button>
          )}
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

      {/* Class Selector Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Chọn Lớp học:
          </label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {availableClasses.map(cls => (
              <option key={cls.MaLop} value={cls.MaLop}>
                {cls.TenLop} ({cls.MaLop})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-4">
          <div>
            Khóa học: <span className="font-semibold text-slate-900">{selectedCourse?.TenKH || 'Khóa học'}</span>
          </div>
          <div>
            Sĩ số: <span className="font-bold text-blue-700">{enrolledStudents.length} học viên</span>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Bảng điểm học viên lớp {selectedClass?.TenLop}
          </div>
          <div className="text-[11px] text-slate-400">
            Công thức: Tổng kết = 10% Chuyên cần + 30% Giữa kỳ + 60% Cuối kỳ (Đạt: &ge; 5.0)
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã HV</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">Chuyên cần (10%)</th>
                <th className="py-2.5 px-3 text-center">Giữa kỳ (30%)</th>
                <th className="py-2.5 px-3 text-center">Cuối kỳ (60%)</th>
                <th className="py-2.5 px-3 text-center">Tổng kết</th>
                <th className="py-2.5 px-3 text-center">Xếp loại</th>
                <th className="py-2.5 px-3">Nhận xét giảng viên</th>
                <th className="py-2.5 px-3 text-right">Thao tác & Chứng chỉ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Lớp học này hiện chưa có học viên nào ghi danh.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((st, idx) => {
                  const studentData = gradesMap[st.maHV] || {
                    chuyenCan: 9,
                    giuaKy: 8,
                    cuoiKy: 8.5,
                    nhanXet: '',
                  };
                  const currentTotal = Number(
                    (
                      studentData.chuyenCan * 0.1 +
                      studentData.giuaKy * 0.3 +
                      studentData.cuoiKy * 0.6
                    ).toFixed(1)
                  );
                  const isPassed = currentTotal >= 5.0;
                  const rank =
                    currentTotal >= 9.0
                      ? 'Xuất sắc'
                      : currentTotal >= 8.0
                      ? 'Giỏi'
                      : currentTotal >= 6.5
                      ? 'Khá'
                      : currentTotal >= 5.0
                      ? 'Trung bình'
                      : 'Yếu';

                  const certIssued = certificateList.find(
                    c => c.MaHV === st.maHV && c.MaLop === selectedClassId
                  );

                  return (
                    <tr key={`${st.maHV}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.maHV}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{st.tenHV}</td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={studentData.chuyenCan}
                          onChange={e =>
                            handleUpdateStudentGrade(st.maHV, 'chuyenCan', Number(e.target.value))
                          }
                          className="w-16 px-1.5 py-1 text-center font-mono font-semibold bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={studentData.giuaKy}
                          onChange={e =>
                            handleUpdateStudentGrade(st.maHV, 'giuaKy', Number(e.target.value))
                          }
                          className="w-16 px-1.5 py-1 text-center font-mono font-semibold bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={studentData.cuoiKy}
                          onChange={e =>
                            handleUpdateStudentGrade(st.maHV, 'cuoiKy', Number(e.target.value))
                          }
                          className="w-16 px-1.5 py-1 text-center font-mono font-semibold bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sm">
                        <span className={isPassed ? 'text-emerald-700' : 'text-rose-600'}>
                          {currentTotal.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            rank === 'Xuất sắc'
                              ? 'bg-purple-100 text-purple-800'
                              : rank === 'Giỏi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rank === 'Khá'
                              ? 'bg-blue-100 text-blue-800'
                              : rank === 'Trung bình'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={studentData.nhanXet}
                          onChange={e =>
                            handleUpdateStudentGrade(st.maHV, 'nhanXet', e.target.value)
                          }
                          placeholder="Nhận xét sự tiến bộ của học viên..."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveStudentGrade(st.maHV)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                          >
                            Lưu điểm
                          </button>

                          {certIssued ? (
                            <button
                              type="button"
                              onClick={() => setPreviewCert(certIssued)}
                              className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <FileCheck className="w-3 h-3 text-blue-600" />
                              <span>Xem bằng</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!isPassed}
                              onClick={() => handleIssueCert(st.maHV)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${
                                isPassed
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <GraduationCap className="w-3 h-3" />
                              <span>Cấp bằng</span>
                            </button>
                          )}
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

      {/* Modal: Chứng Chỉ Tốt Nghiệp KIẾN TRẺ */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-4 border-amber-600/30 relative text-slate-900 my-8">
            {/* Background Watermark Pattern */}
            <div className="absolute inset-4 border-2 border-amber-700/20 rounded-xl pointer-events-none p-2 flex flex-col justify-between">
              <div className="flex justify-between text-amber-600 text-sm">✦ ✦ ✦</div>
              <div className="flex justify-between text-amber-600 text-sm">✦ ✦ ✦</div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
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

            {/* Certificate Content */}
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

            {/* Modal Actions */}
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

      {/* SQL Server Data Workbench Modal */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="DiemSo"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
