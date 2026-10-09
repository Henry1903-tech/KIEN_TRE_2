import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhieuGhiDanh } from '../types';
import { formatVND, formatDateTime, numberToWordsVietnamese } from '../utils/formatters';
import { generateVietQRDataURL } from '../utils/generators';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  Receipt,
  Search,
  QrCode,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Tag,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface PaymentManagerProps {
  initialEnrollmentCode?: string;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({ initialEnrollmentCode }) => {
  const {
    enrollmentList,
    studentList,
    classList,
    courseList,
    invoiceList,
    paymentList,
    voucherList,
    applyVoucher,
    executePayment,
    currentUser,
  } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'GiaoVu';

  const [searchCode, setSearchCode] = useState(initialEnrollmentCode || '');
  const [selectedEnrollment, setSelectedEnrollment] = useState<PhieuGhiDanh | null>(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucherMsg, setAppliedVoucherMsg] = useState('');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  // Payment form states
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'TienMat' | 'ChuyenKhoan' | 'TheATM' | 'QRCode'>('TienMat');
  const [cardOrTransactionId, setCardOrTransactionId] = useState('');
  const [note, setNote] = useState('');

  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState<{
    maHoaDon: string;
    maThanhToan: string;
    maPhieu: string;
    studentName: string;
    studentCode: string;
    className: string;
    courseName: string;
    originalFee: number;
    discount: number;
    amountPaidThisTime: number;
    totalPaidOverall: number;
    remainingDebt: number;
    paymentMethodText: string;
    dateTime: string;
    cashierName: string;
  } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // If initialEnrollmentCode is passed
  useEffect(() => {
    if (initialEnrollmentCode) {
      setSearchCode(initialEnrollmentCode);
      lookupEnrollment(initialEnrollmentCode);
    }
  }, [initialEnrollmentCode]);

  const lookupEnrollment = (code: string) => {
    setNotification(null);
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) {
      setNotification({ type: 'error', text: 'Vui lòng nhập Mã phiếu ghi danh hoặc Số điện thoại học viên!' });
      return;
    }

    // Try finding by enrollment code or student phone
    const student = studentList.find(s => s.SoDienThoai === trimmed);
    let found = enrollmentList.find(e => e.MaPhieuGhiDanh.toLowerCase() === trimmed);

    if (!found && student) {
      found = enrollmentList.find(e => e.MaHV === student.MaHV && e.TrangThai !== 'Huy');
    }

    if (found) {
      if (found.TrangThai === 'Huy') {
        setNotification({ type: 'error', text: 'Phiếu ghi danh này đã bị hủy, không thể thanh toán!' });
        setSelectedEnrollment(null);
        return;
      }
      setSelectedEnrollment(found);
      const invoice = invoiceList.find(i => i.MaPhieuGhiDanh === found!.MaPhieuGhiDanh);
      const remaining = invoice ? invoice.TienConNo : found.HocPhi;
      setPaymentAmount(remaining);
      setDiscountAmount(invoice ? invoice.TienGiamGia : 0);
      setNotification({
        type: 'success',
        text: `Đã tìm thấy phiếu ${found.MaPhieuGhiDanh}. Học phí gốc: ${formatVND(found.HocPhi)}`,
      });
    } else {
      setSelectedEnrollment(null);
      setNotification({
        type: 'error',
        text: 'Không tìm thấy phiếu ghi danh hoặc học viên khớp với thông tin đã nhập!',
      });
    }
  };

  // Derive information for selected enrollment
  const currentStudent = selectedEnrollment
    ? studentList.find(s => s.MaHV === selectedEnrollment.MaHV)
    : null;
  const currentClass = selectedEnrollment
    ? classList.find(c => c.MaLop === selectedEnrollment.MaLop)
    : null;
  const currentCourse = currentClass
    ? courseList.find(c => c.MaKH === currentClass.MaKH)
    : null;
  const currentInvoice = selectedEnrollment
    ? invoiceList.find(i => i.MaPhieuGhiDanh === selectedEnrollment.MaPhieuGhiDanh)
    : null;

  const originalFee = selectedEnrollment ? selectedEnrollment.HocPhi : 0;
  const currentDaTra = currentInvoice ? currentInvoice.TienThucThu : 0;
  const netDueTotal = Math.max(0, originalFee - discountAmount);
  const currentDebt = Math.max(0, netDueTotal - currentDaTra);

  const handleApplyVoucherCode = (codeToApply?: string) => {
    const code = codeToApply || voucherInput;
    if (!code.trim()) {
      setNotification({ type: 'error', text: 'Vui lòng nhập mã voucher khuyến mãi!' });
      return;
    }
    const res = applyVoucher(code, originalFee);
    if (res.success) {
      setDiscountAmount(res.discountAmount);
      setPaymentAmount(Math.max(0, originalFee - res.discountAmount - currentDaTra));
      setAppliedVoucherMsg(res.message);
      setNotification({ type: 'success', text: res.message });
      setVoucherInput(code.toUpperCase());
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  // Trigger VietQR modal
  const handleOpenQRModal = async () => {
    if (!selectedEnrollment || paymentAmount <= 0) {
      setNotification({ type: 'error', text: 'Vui lòng nhập số tiền thanh toán hợp lệ để sinh mã QR!' });
      return;
    }

    const content = `Thanh toan hoc phi ${selectedEnrollment.MaPhieuGhiDanh}`;
    const url = await generateVietQRDataURL(paymentAmount, content);
    setQrDataUrl(url);
    setShowQRModal(true);
  };

  const handleProcessPayment = (confirmedViaQR: boolean = false) => {
    setNotification(null);
    if (!selectedEnrollment) {
      setNotification({ type: 'error', text: 'Chưa chọn phiếu ghi danh nào để thanh toán!' });
      return;
    }

    if (paymentAmount <= 0) {
      setNotification({ type: 'error', text: 'Số tiền thanh toán phải lớn hơn 0 VNĐ!' });
      return;
    }

    if (paymentAmount > currentDebt) {
      setNotification({
        type: 'error',
        text: `Số tiền thanh toán (${formatVND(paymentAmount)}) vượt quá tiền còn nợ (${formatVND(currentDebt)})!`,
      });
      return;
    }

    const finalMethod = confirmedViaQR ? 'QRCode' : paymentMethod;
    const res = executePayment(
      selectedEnrollment.MaPhieuGhiDanh,
      paymentAmount,
      discountAmount,
      finalMethod,
      note,
      cardOrTransactionId || (finalMethod === 'QRCode' ? `QR-${Date.now().toString().slice(-6)}` : undefined),
      paymentMethod === 'TheATM' ? cardOrTransactionId : undefined
    );

    if (res.success && res.maHoaDon && res.maThanhToan) {
      setNotification({ type: 'success', text: res.message });
      setShowQRModal(false);

      // Prepare receipt preview
      const receiptData = {
        maHoaDon: res.maHoaDon,
        maThanhToan: res.maThanhToan,
        maPhieu: selectedEnrollment.MaPhieuGhiDanh,
        studentName: currentStudent?.TenHV || 'Học viên',
        studentCode: selectedEnrollment.MaHV,
        className: currentClass?.TenLop || selectedEnrollment.MaLop,
        courseName: currentCourse?.TenKH || 'Khóa học',
        originalFee,
        discount: discountAmount,
        amountPaidThisTime: paymentAmount,
        totalPaidOverall: currentDaTra + paymentAmount,
        remainingDebt: Math.max(0, currentDebt - paymentAmount),
        paymentMethodText:
          finalMethod === 'TienMat'
            ? 'Tiền mặt tại quầy'
            : finalMethod === 'QRCode'
            ? 'Quét mã VietQR NAPAS'
            : finalMethod === 'ChuyenKhoan'
            ? 'Chuyển khoản ngân hàng'
            : 'Thẻ tín dụng / ATM',
        dateTime: formatDateTime(new Date().toISOString()),
        cashierName: currentUser?.TenNV || 'Lý Hoàng Minh (Kế toán)',
      };

      setActiveReceiptData(receiptData);
      setShowReceiptModal(true);

      // Auto update paymentAmount for any remaining
      const newRemaining = Math.max(0, currentDebt - paymentAmount);
      setPaymentAmount(newRemaining);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  // Generate and download PNG receipt (matching System.Drawing in Chapter 4.3.5.3)
  const downloadReceiptPNG = () => {
    if (!activeReceiptData) return;

    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 950;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 650, 950);

    // Header gradient (Xanh thương hiệu KIẾN TRẺ)
    const gradient = ctx.createLinearGradient(0, 0, 650, 140);
    gradient.addColorStop(0, '#065f46');
    gradient.addColorStop(1, '#0d9488');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 650, 140);

    // Header texts
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHIẾU THU HỌC PHÍ', 325, 55);

    ctx.font = '600 13px Arial, sans-serif';
    ctx.fillText('CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ', 325, 82);

    ctx.font = 'normal 11px Arial, sans-serif';
    ctx.fillText('Trụ sở: 158 Hoàng Hoa Thám, P.12, Tân Bình · Hotline: 028 3812 8888', 325, 105);

    // Meta box
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`Mã phiếu: ${activeReceiptData.maPhieu}`, 45, 175);
    ctx.fillText(`Mã hóa đơn: ${activeReceiptData.maHoaDon}`, 45, 198);
    ctx.fillText(`Ngày thu: ${activeReceiptData.dateTime}`, 45, 221);

    ctx.fillText(`Mã thanh toán: ${activeReceiptData.maThanhToan}`, 370, 175);
    ctx.fillText(`Hình thức: ${activeReceiptData.paymentMethodText}`, 370, 198);
    ctx.fillText(`Thu ngân: ${activeReceiptData.cashierName}`, 370, 221);

    // Section 1: Thông tin học viên
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(40, 245, 570, 28);
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('THÔNG TIN HỌC VIÊN', 50, 264);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 13px Arial, sans-serif';
    ctx.fillText(`Họ tên: ${activeReceiptData.studentName}`, 50, 298);
    ctx.fillText(`Mã học viên: ${activeReceiptData.studentCode}`, 50, 324);
    ctx.fillText(`Lớp học: ${activeReceiptData.className}`, 340, 298);
    ctx.fillText(`Khóa học: ${activeReceiptData.courseName}`, 340, 324);

    // Section 2: Chi tiết học phí
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(40, 355, 570, 28);
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('CHI TIẾT THANH TOÁN HỌC PHÍ', 50, 374);

    // Table rows
    const drawRow = (y: number, label: string, val: string, isBold: boolean = false, color: string = '#1e293b') => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, y - 18, 570, 26);
      ctx.fillStyle = color;
      ctx.font = isBold ? 'bold 13px Arial, sans-serif' : 'normal 13px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, 50, y);
      ctx.textAlign = 'right';
      ctx.fillText(val, 600, y);
    };

    drawRow(415, 'Học phí niêm yết ban đầu:', formatVND(activeReceiptData.originalFee));
    drawRow(445, 'Chiết khấu / Giảm giá:', formatVND(activeReceiptData.discount));
    drawRow(475, 'Tổng tiền phải nộp sau giảm:', formatVND(activeReceiptData.originalFee - activeReceiptData.discount), true, '#0f172a');
    drawRow(505, 'SỐ TIỀN THU LẦN NÀY:', formatVND(activeReceiptData.amountPaidThisTime), true, '#0284c7');
    drawRow(535, 'Tổng số tiền đã tích lũy nộp:', formatVND(activeReceiptData.totalPaidOverall));
    drawRow(565, 'SỐ TIỀN CÒN NỢ (CÔNG NỢ):', formatVND(activeReceiptData.remainingDebt), true, activeReceiptData.remainingDebt > 0 ? '#e11d48' : '#16a34a');

    // Amount in words
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'italic 12px Arial, sans-serif';
    ctx.fillText(
      `Bằng chữ: ${numberToWordsVietnamese(activeReceiptData.amountPaidThisTime)}`,
      50,
      610
    );

    // Notes
    ctx.fillStyle = '#64748b';
    ctx.font = 'normal 11px Arial, sans-serif';
    ctx.fillText('• Học phí đã nộp không hoàn lại sau 07 ngày kể từ ngày khai giảng.', 50, 650);
    ctx.fillText('• Quý học viên và phụ huynh vui lòng bảo quản biên lai để đối soát khi cần thiết.', 50, 668);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KIẾN TRẺ trân trọng cảm ơn Quý phụ huynh và Học viên!', 325, 715);

    // Signatures
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('NGƯỜI NỘP TIỀN', 160, 765);
    ctx.fillText('NGƯỜI THU TIỀN', 490, 765);

    ctx.font = 'normal 11px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('(Ký, ghi rõ họ tên)', 160, 782);
    ctx.fillText('(Ký, ghi rõ họ tên)', 490, 782);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(activeReceiptData.cashierName, 490, 860);

    // Download image
    const link = document.createElement('a');
    link.download = `BienLai_${activeReceiptData.maHoaDon}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-700" />
            <span>Thanh toán Học phí & Hóa đơn</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Xử lý giao dịch thu tiền, xuất biên lai điện tử PNG và sinh mã VietQR theo SP_ThanhToan
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Xem và truy vấn bảng HoaDon & LichSuThanhToan trong CSDL SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server (HoaDon / LichSuThanhToan)</span>
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center justify-between">
          <span>Phân quyền Giáo vụ: Bạn chỉ có quyền tra cứu và xem trạng thái học phí của học viên. Chức năng lập phiếu thu và xác nhận thu tiền thuộc về Kế toán viên.</span>
          <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Xem trạng thái</span>
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

      {/* Main Payment Form Container (Hình 4.6) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
        {/* Tra cứu phiếu */}
        <div className="pb-4 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Tra cứu thông tin Phiếu ghi danh hoặc SĐT
          </div>
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupEnrollment(searchCode)}
                placeholder="Nhập mã phiếu (PGD-...) hoặc SĐT học viên..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="button"
              onClick={() => lookupEnrollment(searchCode)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              Tra cứu
            </button>
          </div>
        </div>

        {/* Thông tin phiếu ghi danh được chọn */}
        {selectedEnrollment && currentStudent ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Học viên thanh toán:</span>
                <span className="font-bold text-slate-900 text-sm">{currentStudent.TenHV}</span>
                <span className="text-slate-500 block text-[11px] font-mono mt-0.5">
                  {currentStudent.MaHV} · SĐT: {currentStudent.SoDienThoai}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Khóa học & Lớp:</span>
                <span className="font-semibold text-slate-900 block truncate">
                  {currentCourse?.TenKH || 'Khóa học'}
                </span>
                <span className="text-blue-700 font-semibold block text-[11px]">
                  {currentClass?.TenLop || selectedEnrollment.MaLop}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Học phí gốc:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatVND(originalFee)}
                </span>
                <span className="text-emerald-700 block text-[11px] font-mono">
                  Đã trả: {formatVND(currentDaTra)}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Dư nợ còn lại (TienConNo):</span>
                <span
                  className={`font-mono font-black text-base block tabular-nums ${
                    currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {formatVND(currentDebt)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Trạng thái: {currentDebt === 0 ? 'Đã thanh toán đủ' : 'Chưa thu đủ'}
                </span>
              </div>
            </div>

            {/* Form chi tiết thu tiền (Hình 4.6 Chi tiết thanh toán) */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Chi tiết thu học phí hôm nay
                </h3>

                {/* Voucher / Coupon Code Bar */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Nhập mã voucher..."
                      value={voucherInput}
                      onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-mono uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyVoucherCode()}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition-colors shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* Fast Voucher Badges */}
              {voucherList && voucherList.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Mã ưu đãi tuyển sinh:
                  </span>
                  {voucherList.map(v => (
                    <button
                      key={v.MaVoucher}
                      type="button"
                      onClick={() => handleApplyVoucherCode(v.MaVoucher)}
                      className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-mono font-bold transition-colors"
                      title={`${v.TenChuongTrinh} - Giảm ${v.LoaiGiam === 'PhanTram' ? `${v.GiaTriGiam}%` : formatVND(v.GiaTriGiam)}`}
                    >
                      {v.MaVoucher} ({v.LoaiGiam === 'PhanTram' ? `-${v.GiaTriGiam}%` : `-${formatVND(v.GiaTriGiam)}`})
                    </button>
                  ))}
                </div>
              )}

              {appliedVoucherMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{appliedVoucherMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Giảm giá / Học bổng (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={discountAmount}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setDiscountAmount(val);
                      setPaymentAmount(Math.max(0, originalFee - val - currentDaTra));
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Số tiền đóng hôm nay (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={currentDebt}
                    step="100000"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Bằng chữ: <span className="italic">{numberToWordsVietnamese(paymentAmount)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Hình thức thanh toán
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e =>
                      setPaymentMethod(
                        e.target.value as 'TienMat' | 'ChuyenKhoan' | 'TheATM' | 'QRCode'
                      )
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="TienMat">Tiền mặt tại quầy (TienMat)</option>
                    <option value="QRCode">Quét mã QR (VietQR Chuẩn)</option>
                    <option value="ChuyenKhoan">Chuyển khoản (ChuyenKhoan)</option>
                    <option value="TheATM">Thẻ tín dụng / ATM (POS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mã GD / Số thẻ (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={cardOrTransactionId}
                    onChange={e => setCardOrTransactionId(e.target.value)}
                    placeholder="Mã GD ngân hàng hoặc số thẻ..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ghi chú giao dịch
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ghi chú đợt thanh toán, người nộp thay..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">
                  * Hệ thống tự động kích hoạt Stored Procedure SP_ThanhToan (Transaction ACID)
                </div>

                <div className="flex items-center gap-2">
                  {paymentMethod === 'QRCode' && (
                    <button
                      type="button"
                      onClick={handleOpenQRModal}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Xem mã VietQR</span>
                    </button>
                  )}

                  {isReadOnly ? (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200">
                      Chế độ xem trạng thái (Dành cho Giáo vụ)
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={currentDebt <= 0 || paymentAmount <= 0}
                      onClick={() => handleProcessPayment(false)}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận Thu Tiền</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            Vui lòng nhập Mã phiếu ghi danh hoặc Số điện thoại học viên ở ô tra cứu bên trên để tải thông tin hóa đơn.
          </div>
        )}
      </div>

      {/* Audit Log / Payment History DataGridView (Hình 3.35) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Lịch sử giao dịch thanh toán (Audit Log bất biến: {paymentList.length})
          </div>
          <div className="text-[11px] text-slate-400">
            Dữ liệu từ bảng LichSuThanhToan
          </div>
        </div>

        <div className="overflow-x-auto max-h-[320px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã TT</th>
                <th className="py-2.5 px-3">Mã HĐ</th>
                <th className="py-2.5 px-3">Mã HV</th>
                <th className="py-2.5 px-3 text-right">Số tiền thu</th>
                <th className="py-2.5 px-3">Hình thức</th>
                <th className="py-2.5 px-3">Ngày thanh toán</th>
                <th className="py-2.5 px-3">Thu ngân</th>
                <th className="py-2.5 px-3">Mã GD / Thẻ</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paymentList.map(p => {
                const staff = currentUser && currentUser.MaNV === p.NhanVienThu ? currentUser.TenNV : p.NhanVienThu;
                const student = studentList.find(s => s.MaHV === p.MaHV);
                const invoice = invoiceList.find(i => i.MaHoaDon === p.MaHoaDon);
                const enrollment = enrollmentList.find(e => e.MaPhieuGhiDanh === invoice?.MaPhieuGhiDanh);
                const cls = classList.find(c => c.MaLop === enrollment?.MaLop);

                return (
                  <tr key={p.MaThanhToan} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {p.MaThanhToan}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{p.MaHoaDon}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{p.MaHV}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {formatVND(p.SoTienThanhToan)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                        {p.HinhThucThanhToan}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {p.NgayThanhToan}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{staff || 'Kế toán'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {p.MaGiaoDich || p.SoTheFISA || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReceiptData({
                            maHoaDon: p.MaHoaDon,
                            maThanhToan: p.MaThanhToan,
                            maPhieu: invoice?.MaPhieuGhiDanh || 'PGD-2026',
                            studentName: student?.TenHV || 'Học viên',
                            studentCode: p.MaHV,
                            className: cls?.TenLop || 'Lớp học',
                            courseName: cls?.MaKH || 'Khóa học',
                            originalFee: invoice ? invoice.TongTien : p.SoTienThanhToan,
                            discount: invoice ? invoice.TienGiamGia : 0,
                            amountPaidThisTime: p.SoTienThanhToan,
                            totalPaidOverall: invoice ? invoice.TienThucThu : p.SoTienThanhToan,
                            remainingDebt: invoice ? invoice.TienConNo : 0,
                            paymentMethodText: p.HinhThucThanhToan,
                            dateTime: p.NgayThanhToan,
                            cashierName: staff || 'Kế toán',
                          });
                          setShowReceiptModal(true);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Biên lai</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: VietQR Thanh toán (Matching Hình 4.7) */}
      {showQRModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-center">
            {/* Header */}
            <div className="bg-emerald-700 text-white p-4">
              <div className="text-sm font-bold tracking-wide uppercase">
                MÃ QR THANH TOÁN
              </div>
              <div className="text-xs text-emerald-100 mt-0.5">
                KIẾN TRẺ EDUCATION
              </div>
            </div>

            {/* QR Content */}
            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600 font-semibold">
                Quét mã QR bên dưới để thanh toán học phí
              </div>

              <div className="flex justify-center">
                <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-xs inline-block">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="VietQR Code" className="w-48 h-48 mx-auto" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                      Đang sinh mã QR...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-slate-600">
                  Mã phiếu: <span className="font-mono font-bold text-slate-900">{selectedEnrollment.MaPhieuGhiDanh}</span>
                </div>
                <div className="text-sm font-bold text-rose-600 font-mono">
                  Số tiền: {formatVND(paymentAmount)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Nội dung: <span className="font-mono">Thanh toan hoc phi - {selectedEnrollment.MaPhieuGhiDanh}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">
                  Sử dụng app ngân hàng quét mã để hoàn tất thanh toán.
                  <br />
                  Mã QR có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này.
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessPayment(true)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Xác nhận đã quét
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Biên Lai Thu Học Phí (Matching Hình 4.8 & Phụ lục C.2) */}
      {showReceiptModal && activeReceiptData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-8">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 text-center">
              <h2 className="text-base font-extrabold tracking-wider uppercase">
                PHIẾU THU HỌC PHÍ
              </h2>
              <div className="text-xs text-emerald-100 font-medium mt-0.5">
                KIẾN TRẺ EDUCATION
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500">Mã phiếu: </span>
                  <span className="font-mono font-bold text-blue-700">{activeReceiptData.maPhieu}</span>
                </div>
                <div>
                  <span className="text-slate-500">Mã hóa đơn: </span>
                  <span className="font-mono font-bold text-slate-800">{activeReceiptData.maHoaDon}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Ngày thu: </span>
                  <span className="font-mono">{activeReceiptData.dateTime}</span>
                </div>
              </div>

              {/* Student info */}
              <div>
                <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-100">
                  THÔNG TIN HỌC VIÊN
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Họ tên:</span>
                    <span className="font-bold text-slate-900">{activeReceiptData.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã học viên:</span>
                    <span className="font-mono">{activeReceiptData.studentCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lớp học:</span>
                    <span className="font-semibold">{activeReceiptData.className}</span>
                  </div>
                </div>
              </div>

              {/* Payment table */}
              <div>
                <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-100">
                  THÔNG TIN THANH TOÁN
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="flex justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                    <span className="text-slate-600 font-semibold">Nội dung</span>
                    <span className="text-slate-600 font-semibold">Số tiền</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Học phí gốc</span>
                    <span className="font-mono tabular-nums">{formatVND(activeReceiptData.originalFee)}</span>
                  </div>
                  {activeReceiptData.discount > 0 && (
                    <div className="flex justify-between px-3 py-1.5 border-b border-slate-100 text-emerald-700">
                      <span>Giảm giá / Ưu đãi</span>
                      <span className="font-mono tabular-nums">-{formatVND(activeReceiptData.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-3 py-1.5 border-b border-slate-100 font-semibold">
                    <span className="text-slate-800">Tổng cần trả</span>
                    <span className="font-mono tabular-nums">
                      {formatVND(activeReceiptData.originalFee - activeReceiptData.discount)}
                    </span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 border-b border-slate-100 bg-blue-50/50 font-bold text-blue-800">
                    <span>ĐÃ ĐÓNG (Lần này)</span>
                    <span className="font-mono tabular-nums">
                      {formatVND(activeReceiptData.amountPaidThisTime)}
                    </span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 font-bold">
                    <span className="text-rose-600">Còn nợ</span>
                    <span className="font-mono tabular-nums text-rose-600">
                      {formatVND(activeReceiptData.remainingDebt)}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 italic mt-1.5">
                  Bằng chữ: {numberToWordsVietnamese(activeReceiptData.amountPaidThisTime)}
                </div>
              </div>

              {/* Policy notes */}
              <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                <div>- Chương trình không hoàn lại học phí sau 7 ngày</div>
                <div>- Vui lòng giữ phiếu thu này để đối soát</div>
              </div>

              <div className="text-center font-semibold text-blue-700 text-xs pt-1">
                Cảm ơn quý phụ huynh và học viên!
              </div>

              <div className="flex justify-between text-center pt-2 text-[11px]">
                <div>
                  <div className="font-semibold text-slate-800">Người nộp</div>
                  <div className="text-[10px] text-slate-400 italic mt-0.5">(Ký tên)</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Người thu</div>
                  <div className="text-[10px] text-slate-400 italic mt-0.5">(Ký tên)</div>
                  <div className="font-bold text-slate-900 mt-6">{activeReceiptData.cashierName}</div>
                </div>
              </div>

              {/* Modal buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={downloadReceiptPNG}
                  className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Lưu ảnh PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Server Data Workbench Modal */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="HoaDon"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
