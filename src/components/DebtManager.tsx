import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDate, formatDateTime } from '../utils/formatters';
import { generateVietQRDataURL } from '../utils/generators';
import {
  CreditCard,
  AlertTriangle,
  Search,
  Filter,
  Send,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  DollarSign,
  Phone,
  BookOpen,
  Building2,
  X,
  FileText,
  User,
} from 'lucide-react';

export const DebtManager: React.FC = () => {
  const {
    invoiceList,
    enrollmentList,
    studentList,
    classList,
    courseList,
    branchList,
    executePayment,
    sendNotification,
    currentUser,
  } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'GiaoVu';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterAging, setFilterAging] = useState<'ALL' | 'DUE' | 'OVERDUE' | 'CRITICAL'>('ALL');

  // Modal quick pay
  const [payModalData, setPayModalData] = useState<{
    invoiceId: string;
    enrollmentCode: string;
    studentName: string;
    studentPhone: string;
    courseName: string;
    className: string;
    debtAmount: number;
  } | null>(null);

  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'TienMat' | 'ChuyenKhoan' | 'QRCode'>('TienMat');
  const [payNote, setPayNote] = useState('');
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Modal QR VietQR
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrModalInfo, setQrModalInfo] = useState<{
    name: string;
    amount: number;
    code: string;
  } | null>(null);

  // Modal In Giấy Báo Nợ
  const [debtNoticeData, setDebtNoticeData] = useState<any | null>(null);

  // Notification message
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gather all unpaid invoices with detailed student and class info
  const unpaidInvoices = invoiceList
    .filter(inv => inv.TienConNo > 0)
    .map(inv => {
      const enrollment = enrollmentList.find(e => e.MaPhieuGhiDanh === inv.MaPhieuGhiDanh);
      const student = studentList.find(s => s.MaHV === inv.MaHV);
      const cls = enrollment ? classList.find(c => c.MaLop === enrollment.MaLop) : null;
      const course = cls ? courseList.find(c => c.MaKH === cls.MaKH) : null;
      const branch = cls?.MaChiNhanh
        ? branchList.find(b => b.MaChiNhanh === cls.MaChiNhanh)
        : branchList[0];

      // Calculate debt aging in days
      const invoiceDate = new Date(inv.NgayHoaDon);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - invoiceDate.getTime());
      const daysOld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let agingCategory: 'NORMAL' | 'DUE' | 'OVERDUE' | 'CRITICAL' = 'NORMAL';
      if (daysOld > 30) agingCategory = 'CRITICAL';
      else if (daysOld > 15) agingCategory = 'OVERDUE';
      else if (daysOld > 7) agingCategory = 'DUE';

      return {
        ...inv,
        student,
        cls,
        course,
        branch,
        daysOld,
        agingCategory,
      };
    });

  // KPI Calculations
  const totalDebt = unpaidInvoices.reduce((sum, item) => sum + item.TienConNo, 0);
  const totalInvoiced = invoiceList.reduce((sum, item) => sum + item.TongTien, 0);
  const totalCollected = invoiceList.reduce((sum, item) => sum + item.TienThucThu, 0);
  const recoveryRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : '100';
  const overdueCount = unpaidInvoices.filter(i => i.daysOld > 15).length;
  const criticalCount = unpaidInvoices.filter(i => i.daysOld > 30).length;

  // Filter list
  const filteredList = unpaidInvoices.filter(item => {
    if (filterClass !== 'ALL' && item.cls?.MaLop !== filterClass) return false;
    if (filterBranch !== 'ALL' && item.cls?.MaChiNhanh !== filterBranch) return false;

    if (filterAging === 'DUE' && item.daysOld < 7) return false;
    if (filterAging === 'OVERDUE' && item.daysOld <= 15) return false;
    if (filterAging === 'CRITICAL' && item.daysOld <= 30) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.student?.TenHV.toLowerCase().includes(term);
      const matchPhone = item.student?.SoDienThoai.includes(term);
      const matchCode = item.MaHV.toLowerCase().includes(term);
      const matchInvoice = item.MaHoaDon.toLowerCase().includes(term);
      const matchEnroll = item.MaPhieuGhiDanh.toLowerCase().includes(term);
      return matchName || matchPhone || matchCode || matchInvoice || matchEnroll;
    }

    return true;
  });

  const handleOpenPay = (item: any) => {
    setPayModalData({
      invoiceId: item.MaHoaDon,
      enrollmentCode: item.MaPhieuGhiDanh,
      studentName: item.student?.TenHV || 'Học viên',
      studentPhone: item.student?.SoDienThoai || '',
      courseName: item.course?.TenKH || 'Khóa học',
      className: item.cls?.TenLop || item.cls?.MaLop || '',
      debtAmount: item.TienConNo,
    });
    setPayAmountInput(item.TienConNo);
    setPayMethod('TienMat');
    setPayNote('Thu nợ học phí');
    setPaySuccessMsg('');
  };

  const handleConfirmPay = () => {
    if (!payModalData) return;
    if (payAmountInput <= 0) {
      alert('Số tiền thu nợ phải lớn hơn 0 VNĐ!');
      return;
    }
    if (payAmountInput > payModalData.debtAmount) {
      alert('Số tiền thu nợ không được vượt quá số tiền còn nợ!');
      return;
    }

    const res = executePayment(
      payModalData.enrollmentCode,
      payAmountInput,
      0,
      payMethod,
      payNote || 'Thu nợ học phí định kỳ'
    );

    if (res.success) {
      setToast({
        type: 'success',
        text: `Thu nợ thành công ${formatVND(payAmountInput)} cho học viên ${payModalData.studentName}`,
      });
      setPayModalData(null);
    } else {
      setToast({ type: 'error', text: res.message });
    }
  };

  const handleShowQr = async (item: any) => {
    try {
      const qrUrl = await generateVietQRDataURL(
        item.TienConNo,
        `HP ${item.MaPhieuGhiDanh} ${item.student?.TenHV || ''}`.slice(0, 25)
      );
      setQrModalUrl(qrUrl);
      setQrModalInfo({
        name: item.student?.TenHV || 'Học viên',
        amount: item.TienConNo,
        code: item.MaPhieuGhiDanh,
      });
    } catch {
      alert('Không thể tạo mã VietQR!');
    }
  };

  const handleSendReminder = (item: any) => {
    const studentName = item.student?.TenHV || 'Học viên';
    const amountStr = formatVND(item.TienConNo);
    const msg = `[KIẾN TRẺ EDU] Xin chào ${studentName}, trung tâm xin thông báo số học phí còn thiếu là ${amountStr} cho lớp ${item.cls?.TenLop}. Kính đề nghị Quý học viên hoàn tất trước kỳ thi giữa kỳ. Trân trọng!`;

    sendNotification({
      TieuDe: `Nhắc nợ học phí: ${studentName}`,
      NoiDung: msg,
      Loai: 'HocPhi',
      NguoiNhan: `${studentName} (${item.student?.SoDienThoai})`,
      KenhGui: 'Zalo',
    });

    setToast({
      type: 'success',
      text: `Đã gửi thông báo nhắc nợ qua Zalo ZNS cho học viên ${studentName} (${item.student?.SoDienThoai})`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-700" />
            <span>Quản lý Công nợ Học viên</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi danh sách học viên chưa hoàn thành học phí, phân tích tuổi nợ và gửi nhắc nợ tự động
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Học viên còn nợ: <strong className="text-rose-600 font-bold">{unpaidInvoices.length}</strong>
          </span>
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center justify-between">
          <span>Phân quyền Giáo vụ: Bạn có quyền tra cứu và xem danh sách công nợ học phí của học viên. Quyền thu nợ và quản lý công nợ thuộc về Kế toán viên.</span>
          <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Xem công nợ</span>
        </div>
      )}

      {toast && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng công nợ chưa thu</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600 mt-2">{formatVND(totalDebt)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Trên tổng doanh thu: <span className="font-semibold text-slate-700">{formatVND(totalInvoiced)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ thu hồi học phí</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 mt-2">{recoveryRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã thu: {formatVND(totalCollected)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Nợ quá hạn &gt; 15 ngày</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 mt-2">{overdueCount} học viên</div>
          <div className="text-[11px] text-amber-700 mt-1">Cần liên hệ nhắc hạn</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-300 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">Nợ khó đòi &gt; 30 ngày</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-700 mt-2">{criticalCount} học viên</div>
          <div className="text-[11px] text-rose-600 mt-1">Cần lập biên bản cam kết</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Aging Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setFilterAging('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterAging === 'ALL'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({unpaidInvoices.length})
            </button>
            <button
              onClick={() => setFilterAging('DUE')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterAging === 'DUE'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đến hạn (&gt;7 ngày)
            </button>
            <button
              onClick={() => setFilterAging('OVERDUE')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterAging === 'OVERDUE'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quá hạn (&gt;15 ngày)
            </button>
            <button
              onClick={() => setFilterAging('CRITICAL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterAging === 'CRITICAL'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nguy cơ (&gt;30 ngày)
            </button>
          </div>

          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">-- Tất cả lớp học --</option>
            {classList.map(c => (
              <option key={c.MaLop} value={c.MaLop}>
                {c.TenLop} ({c.MaLop})
              </option>
            ))}
          </select>

          {/* Branch Filter */}
          <select
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">-- Tất cả chi nhánh --</option>
            {branchList.map(b => (
              <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                {b.TenChiNhanh}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên HV, SĐT, mã hóa đơn..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Debt Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Mã HĐ / Phiếu</th>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Lớp học & Chi nhánh</th>
                <th className="px-4 py-3 text-right">Học phí gốc</th>
                <th className="px-4 py-3 text-right">Đã thanh toán</th>
                <th className="px-4 py-3 text-right">Còn nợ</th>
                <th className="px-4 py-3 text-center">Tuổi nợ (Ngày)</th>
                <th className="px-4 py-3 text-center">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Không có khoản công nợ nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => (
                  <tr key={item.MaHoaDon} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-slate-900">{item.MaHoaDon}</div>
                      <div className="text-[11px] text-slate-400">{item.MaPhieuGhiDanh}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.student?.TenHV || item.MaHV}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{item.student?.SoDienThoai || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{item.cls?.TenLop || 'Lớp học'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{item.branch?.TenChiNhanh || 'Chi nhánh'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-slate-600 font-medium">
                      {formatVND(item.TongTien)}
                    </td>

                    <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                      {formatVND(item.TienThucThu)}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      {formatVND(item.TienConNo)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.agingCategory === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : item.agingCategory === 'OVERDUE'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : item.agingCategory === 'DUE'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.daysOld} ngày
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center space-x-1 whitespace-nowrap">
                      {isReadOnly ? (
                        <>
                          <button
                            onClick={() => handleShowQr(item)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition"
                            title="Tạo VietQR thanh toán nhanh"
                          >
                            <QrCode className="w-3.5 h-3.5 inline mr-1" />
                            QR
                          </button>
                          <button
                            onClick={() => setDebtNoticeData(item)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
                            title="In giấy báo công nợ học phí"
                          >
                            <Printer className="w-3.5 h-3.5 inline mr-1" />
                            Xem phiếu
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Thu nợ ngay */}
                          <button
                            onClick={() => handleOpenPay(item)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition shadow-xs"
                            title="Thu tiền nợ ngay"
                          >
                            Thu nợ
                          </button>

                          {/* VietQR */}
                          <button
                            onClick={() => handleShowQr(item)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition"
                            title="Tạo VietQR thanh toán nhanh"
                          >
                            <QrCode className="w-3.5 h-3.5 inline mr-1" />
                            QR
                          </button>

                          {/* Gửi nhắc Zalo */}
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded text-[11px] font-semibold transition"
                            title="Gửi tin nhắn Zalo ZNS đòi nợ"
                          >
                            <Send className="w-3 h-3 inline mr-1" />
                            Nhắc nợ
                          </button>

                          {/* In giấy báo nợ */}
                          <button
                            onClick={() => setDebtNoticeData(item)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
                            title="In giấy báo công nợ học phí"
                          >
                            <Printer className="w-3.5 h-3.5 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THU NỢ HỌC PHÍ */}
      {payModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Quyết toán & Thu tiền nợ học phí
                </h3>
                <div className="text-xs text-slate-400">Phiếu {payModalData.enrollmentCode}</div>
              </div>
              <button
                onClick={() => setPayModalData(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học viên:</span>
                  <span className="font-bold text-slate-900">{payModalData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lớp học:</span>
                  <span className="font-semibold text-slate-800">{payModalData.className}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-rose-600 font-bold">
                  <span>Dư nợ hiện tại:</span>
                  <span>{formatVND(payModalData.debtAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số tiền thu đợt này (VNĐ) *
                </label>
                <input
                  type="number"
                  min="10000"
                  max={payModalData.debtAmount}
                  step="50000"
                  value={payAmountInput}
                  onChange={e => setPayAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700 font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPayAmountInput(payModalData.debtAmount)}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded hover:bg-blue-100"
                  >
                    Thanh toán toàn bộ (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmountInput(Math.round(payModalData.debtAmount / 2))}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded hover:bg-slate-200"
                  >
                    Thanh toán 50%
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hình thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('TienMat')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      payMethod === 'TienMat'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Tiền mặt
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('ChuyenKhoan')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      payMethod === 'ChuyenKhoan'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Chuyển khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('QRCode')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      payMethod === 'QRCode'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    VietQR
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú phiếu thu</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  placeholder="Ví dụ: Học viên nộp tiền đợt 2 theo cam kết"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalData(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPay}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Xác nhận Thu tiền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIETQR QUICK SCAN */}
      {qrModalUrl && qrModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-base font-bold text-slate-900">Quét mã VietQR thanh toán</h3>
            <p className="text-xs text-slate-500">
              Học viên: <strong className="text-slate-900">{qrModalInfo.name}</strong>
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block mx-auto">
              <img src={qrModalUrl} alt="VietQR" className="w-56 h-56 mx-auto rounded-lg" />
            </div>

            <div className="text-sm font-black text-rose-600">
              Số tiền: {formatVND(qrModalInfo.amount)}
            </div>

            <button
              onClick={() => {
                setQrModalUrl(null);
                setQrModalInfo(null);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}

      {/* MODAL: GIẤY BÁO CÔNG NỢ & CAM KẾT (PRINT-READY) */}
      {debtNoticeData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden my-6">
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Giấy Báo Công Nợ & Cam Kết Hoàn Tất Học Phí
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  In / Lưu PDF
                </button>
                <button
                  onClick={() => setDebtNoticeData(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-8 text-slate-900 leading-relaxed text-xs space-y-4">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                <div>
                  <div className="font-bold uppercase text-[11px] text-emerald-900">
                    CÔNG TY CP ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
                  </div>
                  <div className="text-[10px] text-slate-600">Phòng Kế toán & Quản trị Tài chính</div>
                  <div className="text-[10px] text-slate-500 font-mono">Số: {debtNoticeData.MaHoaDon}/TB-HP</div>
                </div>
                <div className="text-right">
                  <div className="font-bold uppercase text-[10px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    TP. HCM, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <div className="text-center pt-2 pb-1">
                <h2 className="text-base font-bold uppercase tracking-wide text-rose-700">
                  GIẤY BÁO NỢ HỌC PHÍ VÀ XÁC NHẬN CAM KẾT
                </h2>
                <div className="text-[11px] italic text-slate-600">
                  (Kính gửi: Quý Phụ huynh / Học viên {debtNoticeData.student?.TenHV})
                </div>
              </div>

              <div className="space-y-2 text-justify">
                <p>
                  Phòng Kế toán Công ty Cổ phần Đầu tư Giáo dục KIẾN TRẺ trân trọng thông báo tình trạng công nợ học phí của học viên theo hồ sơ đào tạo như sau:
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div>• Họ và tên học viên: <strong>{debtNoticeData.student?.TenHV}</strong> (Mã HV: <span className="font-mono">{debtNoticeData.MaHV}</span>)</div>
                  <div>• Số điện thoại: <strong>{debtNoticeData.student?.SoDienThoai}</strong></div>
                  <div>• Lớp học: <strong>{debtNoticeData.cls?.TenLop}</strong> ({debtNoticeData.cls?.MaLop})</div>
                  <div>• Khóa đào tạo: <strong>{debtNoticeData.course?.TenKH}</strong></div>
                  <div>• Tổng mức học phí: <strong>{formatVND(debtNoticeData.TongTien)}</strong></div>
                  <div>• Số tiền đã thanh toán: <strong className="text-emerald-700">{formatVND(debtNoticeData.TienThucThu)}</strong></div>
                  <div className="text-rose-700 font-bold">• SỐ TIỀN CÒN PHẢI NỘP: {formatVND(debtNoticeData.TienConNo)}</div>
                </div>

                <p>
                  Theo Quy chế Tài chính của KIẾN TRẺ, học viên cần hoàn tất toàn bộ học phí để đủ điều kiện thi kết thúc môn và xét cấp văn bằng tốt nghiệp.
                </p>

                <div className="pt-2">
                  <div className="font-bold text-slate-900 mb-1">CAM KẾT CỦA HỌC VIÊN:</div>
                  <div className="border border-slate-300 p-2 rounded text-[11px] italic bg-slate-50">
                    Tôi cam kết sẽ hoàn tất khoản học phí còn thiếu số tiền <strong>{formatVND(debtNoticeData.TienConNo)}</strong> trước ngày: .......... / .......... / 2026. Nếu quá thời hạn trên, tôi xin hoàn toàn chấp nhận các quy định xử lý học vụ của Trung tâm.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 pb-4 text-center">
                <div>
                  <div className="font-bold uppercase text-[11px]">HỌC VIÊN CAM KẾT</div>
                  <div className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-semibold text-slate-700">
                    {debtNoticeData.student?.TenHV}
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase text-[11px]">PHÒNG KẾ TOÁN TRUNG TÂM</div>
                  <div className="text-[10px] italic text-slate-500">(Ký tên và xác nhận)</div>
                  <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                    {currentUser?.TenNV || 'Lê Thị Thu Thủy'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
