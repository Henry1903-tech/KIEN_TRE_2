import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HocVien, LopHoc, KhoaHoc, PhieuGhiDanh } from '../types';
import { formatDate, formatVND } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  FileCheck,
  Search,
  Printer,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  ShieldCheck,
  PenTool,
  Clock,
  Sparkles,
  Layers,
  BookOpen,
  Terminal,
} from 'lucide-react';

interface ContractData {
  contractCode: string;
  student: HocVien;
  enrollment: PhieuGhiDanh;
  cls: LopHoc;
  course: KhoaHoc;
  createdDate: string;
  commitmentScore: string;
  hasStudentSignature: boolean;
  hasDirectorSignature: boolean;
}

export const TrainingContractManager: React.FC = () => {
  const { studentList, enrollmentList, classList, courseList, invoiceList, branchList, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [customCommitment, setCustomCommitment] = useState<string>('Đạt chứng chỉ chuẩn đầu ra và hoàn thành đồ án tốt nghiệp xuất sắc');
  const [activeContract, setActiveContract] = useState<ContractData | null>(null);
  const [studentSigned, setStudentSigned] = useState(false);
  const [directorSigned, setDirectorSigned] = useState(true);
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  // Available enrollments for generating contracts
  const validEnrollments = enrollmentList.filter(e => e.TrangThai === 'ChinhThuc');

  // Filtered search list
  const filteredEnrollments = validEnrollments.filter(e => {
    const student = studentList.find(s => s.MaHV === e.MaHV);
    const cls = classList.find(c => c.MaLop === e.MaLop);
    const query = searchTerm.toLowerCase();

    const matchCode = e.MaPhieuGhiDanh.toLowerCase().includes(query);
    const matchStudent =
      student &&
      (student.TenHV.toLowerCase().includes(query) ||
        student.SoDienThoai.includes(searchTerm) ||
        student.MaHV.toLowerCase().includes(query));
    const matchClass = cls && cls.TenLop.toLowerCase().includes(query);

    return matchCode || matchStudent || matchClass;
  });

  const handleSelectEnrollment = (enrollment: PhieuGhiDanh) => {
    const student = studentList.find(s => s.MaHV === enrollment.MaHV);
    const cls = classList.find(c => c.MaLop === enrollment.MaLop);
    const course = cls ? courseList.find(c => c.MaKH === cls.MaKH) : null;

    if (!student || !cls || !course) return;

    let targetGoal = 'Đạt chuẩn đầu ra khóa học';
    if (course.TenKH.includes('IELTS')) targetGoal = 'Cam kết đạt tối thiểu IELTS 6.5 Overall';
    else if (course.TenKH.includes('TOEIC')) targetGoal = 'Cam kết đạt tối thiểu TOEIC 650+ Điểm';
    else if (course.TenKH.includes('C#') || course.TenKH.includes('Lập Trình'))
      targetGoal = 'Cam kết hoàn thành Đồ án Ứng dụng Doanh nghiệp & Giới thiệu việc làm';

    setCustomCommitment(targetGoal);
    setSelectedEnrollmentId(enrollment.MaPhieuGhiDanh);

    const contractCode = `HĐĐT-${enrollment.MaPhieuGhiDanh.replace('PGD-', '')}`;
    setActiveContract({
      contractCode,
      student,
      enrollment,
      cls,
      course,
      createdDate: new Date().toISOString().slice(0, 10),
      commitmentScore: targetGoal,
      hasStudentSignature: studentSigned,
      hasDirectorSignature: directorSigned,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            Hợp Đồng Đào Tạo & Cam Kết Chuẩn Đầu Ra
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn thảo, ký điện tử và xuất bản hợp đồng đào tạo pháp lý song phương kèm điều khoản bảo hiểm đầu ra
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Xem và truy vấn bảng HopDongDaoTao trong SQL Server"
            >
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          {activeContract && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              In / Xuất Bản Hợp Đồng
            </button>
          )}
        </div>
      </div>

      {/* Main 2-column layout: Left selector, Right Contract Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student & Enrollment List */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Danh sách Học viên Chính thức
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                {validEnrollments.length} hồ sơ
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học viên, SĐT, mã PGD..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Enrollment cards list */}
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredEnrollments.map(item => {
                const student = studentList.find(s => s.MaHV === item.MaHV);
                const cls = classList.find(c => c.MaLop === item.MaLop);
                const isSelected = selectedEnrollmentId === item.MaPhieuGhiDanh;

                return (
                  <div
                    key={item.MaPhieuGhiDanh}
                    onClick={() => handleSelectEnrollment(item)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-900">{student?.TenHV || item.MaHV}</div>
                      <span className="font-mono text-[10px] text-slate-500">{item.MaHV}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1">
                      Lớp: <span className="font-medium text-blue-700">{item.MaLop}</span> · {cls?.TenLop}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>Mã: {item.MaPhieuGhiDanh}</span>
                      <span className="font-bold text-slate-700">{formatVND(item.HocPhi)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Contract Preview & Digital Signing */}
        <div className="lg:col-span-8">
          {!activeContract ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
              <FileCheck className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">
                Chưa chọn hồ sơ để lập Hợp đồng Đào tạo
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Vui lòng chọn một học viên từ danh sách bên trái để sinh tự động bản Hợp đồng Đào tạo Nghề và Cam kết
                Chuẩn Đầu ra có đầy đủ giá trị pháp lý.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Interactive Toolbar (Digital signature toggles) */}
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Ký số điện tử:
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={directorSigned}
                      onChange={e => setDirectorSigned(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Chữ ký Giám đốc & Con dấu</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={studentSigned}
                      onChange={e => setStudentSigned(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Chữ ký điện tử Học viên</span>
                  </label>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Mã HĐ: <strong className="text-slate-800">{activeContract.contractCode}</strong>
                </div>
              </div>

              {/* CONTRACT DOCUMENT PAPER (A4 FORMAT) */}
              <div className="p-8 sm:p-12 text-slate-900 font-sans leading-relaxed text-xs space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                  <div>
                    <div className="font-extrabold uppercase text-[12px] text-emerald-900 tracking-wide">
                      CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
                    </div>
                    <div className="text-[10px] text-slate-600">Mã số doanh nghiệp (MST): 0318268688</div>
                    <div className="text-[10px] text-slate-600">
                      Trụ sở: 158 Hoàng Hoa Thám, P. 12, Q. Tân Bình, TP. Hồ Chí Minh
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono">
                      Hotline: 028 3812 8888 · Website: https://kientre.edu.vn
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold uppercase text-[10px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Số: {activeContract.contractCode}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center py-2 space-y-1">
                  <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                    HỢP ĐỒNG ĐÀO TẠO NGHỀ & CAM KẾT CHUẨN ĐẦU RA
                  </h1>
                  <div className="text-[11px] italic text-slate-600">
                    (V/v: Cung ứng dịch vụ đào tạo chuyên sâu và đảm bảo chất lượng đầu ra học viên)
                  </div>
                </div>

                <div className="text-[11px] italic text-slate-600">
                  Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()},
                  tại văn phòng Công ty CP Đầu tư Giáo dục KIẾN TRẺ, hai bên chúng tôi gồm có:
                </div>

                {/* Party A */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 text-slate-800">
                  <div className="font-bold text-emerald-900 uppercase">
                    BÊN A - ĐƠN VỊ ĐÀO TẠO: CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      • Đại diện pháp luật: <strong>TS. Lâm Hoàng Trúc Mai</strong>
                    </div>
                    <div>• Chức vụ: Giám đốc Điều hành</div>
                    <div>• Mã số thuế: 0318268688</div>
                    <div>• Tài khoản: 1028889999 tại Vietcombank - CN Tân Bình</div>
                    <div className="col-span-2">
                      • Cơ sở tổ chức lớp:{' '}
                      {branchList.find(b => b.MaChiNhanh === activeContract.cls.MaChiNhanh)?.DiaChi ||
                        '158 Hoàng Hoa Thám, P.12, Q.Tân Bình, TP.HCM'}
                    </div>
                  </div>
                </div>

                {/* Party B */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 text-slate-800">
                  <div className="font-bold text-blue-900 uppercase">
                    BÊN B - HỌC VIÊN / NGƯỜI HỌC: {activeContract.student.TenHV}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      • Mã học viên: <strong>{activeContract.student.MaHV}</strong>
                    </div>
                    <div>• Số CCCD/CMND: {activeContract.student.CMNDNumber || 'Đang cập nhật'}</div>
                    <div>• Số điện thoại: {activeContract.student.SoDienThoai}</div>
                    <div>• Email: {activeContract.student.Email || 'N/A'}</div>
                    <div className="col-span-2">
                      • Địa chỉ thường trú: {activeContract.student.DiaChi}, {activeContract.student.QuanHuyen},{' '}
                      {activeContract.student.ThanhPho}
                    </div>
                  </div>
                </div>

                {/* Terms and Clauses */}
                <div className="space-y-2 text-justify text-slate-800">
                  <p>
                    Sau khi thỏa thuận và trao đổi về mục tiêu nghề nghiệp, hai bên nhất trí ký kết Hợp đồng đào tạo với
                    các điều khoản cụ thể sau đây:
                  </p>

                  <div className="space-y-1.5 pl-2">
                    <p>
                      <strong>ĐIỀU 1. NỘI DUNG VÀ KHÓA HỌC ĐĂNG KÝ</strong>
                    </p>
                    <div className="pl-3 text-[11px] space-y-1 text-slate-700">
                      <div>
                        1.1. Tên chương trình đào tạo:{' '}
                        <strong>
                          {activeContract.course.TenKH} (Mã khóa: {activeContract.course.MaKH})
                        </strong>
                      </div>
                      <div>
                        1.2. Lớp học chính thức:{' '}
                        <strong>
                          {activeContract.cls.MaLop} - {activeContract.cls.TenLop}
                        </strong>
                      </div>
                      <div>
                        1.3. Lịch học & Khai giảng: Khai giảng ngày{' '}
                        <strong>{formatDate(activeContract.cls.NgayKhaiGiang)}</strong>, dự kiến kết thúc ngày{' '}
                        <strong>{formatDate(activeContract.cls.NgayKetThuc)}</strong>.
                      </div>
                      <div>
                        1.4. Lịch học trong tuần: Thứ 2 - 4 - 6 hoặc Thứ 3 - 5 - 7 (18:00 - 20:30) tại phòng học đạt
                        chuẩn đào tạo quốc tế của KIẾN TRẺ EDU.
                      </div>
                    </div>

                    <p className="pt-1">
                      <strong>ĐIỀU 2. HỌC PHÍ VÀ THANH TOÁN</strong>
                    </p>
                    <div className="pl-3 text-[11px] space-y-1 text-slate-700">
                      <div>
                        2.1. Tổng mức học phí trọn gói:{' '}
                        <strong className="text-slate-900 font-mono">
                          {formatVND(activeContract.enrollment.HocPhi)}
                        </strong>
                      </div>
                      <div>
                        2.2. Học phí đã bao gồm toàn bộ giáo trình gốc, tài liệu bài giảng trực tuyến, phần mềm thực
                        hành và chứng chỉ tốt nghiệp sau khóa học.
                      </div>
                    </div>

                    <p className="pt-1">
                      <strong>ĐIỀU 3. CAM KẾT CHUẨN ĐẦU RA VÀ QUYỀN LỢI ĐẶC BIỆT CỦA BÊN B</strong>
                    </p>
                    <div className="pl-3 text-[11px] space-y-1 text-slate-700">
                      <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-950 font-medium">
                        <span className="font-bold text-blue-800">★ Mục tiêu chuẩn đầu ra cam kết: </span>
                        {activeContract.commitmentScore}
                      </div>
                      <div>
                        3.1. <strong>Chính sách Bảo hành Đào tạo (Học lại miễn phí):</strong> Trong trường hợp Bên B tham
                        gia đầy đủ tối thiểu <strong>85%</strong> số buổi học trên lớp và hoàn thành tối thiểu{' '}
                        <strong>90%</strong> bài tập rèn luyện định kỳ nhưng chưa đạt chuẩn đầu ra cam kết tại kỳ thi
                        đánh giá, Bên A cam kết cho Bên B{' '}
                        <span className="font-bold text-blue-900">
                          học lại hoàn toàn MIỄN PHÍ 100% học phí
                        </span>{' '}
                        ở khóa học tiếp theo trong vòng 12 tháng kể từ ngày bế giảng.
                      </div>
                      <div>
                        3.2. <strong>Hỗ trợ việc làm và thực tập:</strong> Đối với học viên các lớp kỹ thuật công nghệ
                        (C# .NET, Full-Stack), Bên A hỗ trợ đánh giá CV, phỏng vấn thử (Mock Interview) và giới thiệu
                        thực tập tại mạng lưới doanh nghiệp đối tác uy tín của KIẾN TRẺ.
                      </div>
                    </div>

                    <p className="pt-1">
                      <strong>ĐIỀU 4. TRÁCH NHIỆM VÀ NGHĨA VỤ CỦA HỌC VIÊN</strong>
                    </p>
                    <div className="pl-3 text-[11px] space-y-1 text-slate-700">
                      <div>4.1. Đi học đúng giờ, chấp hành nghiêm túc quy chế lớp học và văn hóa học tập văn minh.</div>
                      <div>
                        4.2. Bảo mật tài liệu bài giảng nội bộ của KIẾN TRẺ; không sao chép hoặc phát tán vì mục đích
                        thương mại nếu không có sự đồng ý bằng văn bản của Trung tâm.
                      </div>
                    </div>

                    <p className="pt-1">
                      <strong>ĐIỀU 5. ĐIỀU KHOẢN THI HÀNH</strong>
                    </p>
                    <div className="pl-3 text-[11px] space-y-1 text-slate-700">
                      <div>
                        Hợp đồng này có hiệu lực kể từ ngày ký và được lập thành 02 (hai) bản có giá trị pháp lý như
                        nhau, mỗi bên giữ 01 bản để thực hiện.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures & Seal Box */}
                <div className="grid grid-cols-2 gap-8 pt-6 pb-2 text-center">
                  {/* Party B Signature */}
                  <div>
                    <div className="font-bold uppercase text-[11px]">ĐẠI DIỆN BÊN B (HỌC VIÊN)</div>
                    <div className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                    <div className="h-20 flex flex-col items-center justify-end">
                      {studentSigned ? (
                        <div className="font-serif italic text-blue-700 font-bold text-sm tracking-wide">
                          {activeContract.student.TenHV}
                          <div className="text-[9px] font-sans text-emerald-600 font-normal not-italic flex items-center justify-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            Đã ký điện tử xác thực
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">Chưa ký điện tử</div>
                      )}
                    </div>
                  </div>

                  {/* Party A Signature & Seal */}
                  <div>
                    <div className="font-bold uppercase text-[11px]">ĐẠI DIỆN BÊN A (KIẾN TRẺ)</div>
                    <div className="text-[10px] italic text-slate-500">(Ký tên và đóng dấu pháp nhân)</div>
                    <div className="h-20 flex flex-col items-center justify-end relative">
                      {directorSigned && (
                        <div className="flex flex-col items-center">
                          {/* Simulated Red Corporate Stamp */}
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-rose-500 text-rose-600 text-[8px] font-bold flex flex-col items-center justify-center rotate-[-8deg] opacity-85 pointer-events-none mb-1">
                            <span>KIẾN TRẺ</span>
                            <span className="text-[6px]">0318268688</span>
                            <span className="text-[6px]">ĐÃ DUYỆT</span>
                          </div>
                          <div className="font-bold text-emerald-900 text-xs">TS. Lâm Hoàng Trúc Mai</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="HopDongDaoTao"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
