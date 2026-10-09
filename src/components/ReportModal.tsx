import React from 'react';
import { useApp } from '../context/AppContext';
import { formatVND } from '../utils/formatters';
import { KienTreLogo } from './KienTreLogo';
import {
  Printer,
  Download,
  X,
  FileCheck,
} from 'lucide-react';

interface ReportModalProps {
  onClose: () => void;
  initialBranchId?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ onClose, initialBranchId = 'ALL' }) => {
  const { currentUser, invoiceList, studentList, enrollmentList, classList, branchList } = useApp();

  const activeBranch = branchList.find(b => b.MaChiNhanh === initialBranchId);
  const targetClasses = initialBranchId === 'ALL'
    ? classList
    : classList.filter(c => c.MaChiNhanh === initialBranchId);
  const targetClassIds = new Set(targetClasses.map(c => c.MaLop));

  const targetEnrollments = enrollmentList.filter(e => targetClassIds.has(e.MaLop) && e.TrangThai !== 'Huy');
  const targetEnrollmentCodes = new Set(targetEnrollments.map(e => e.MaPhieuGhiDanh));

  const targetInvoices = invoiceList.filter(i => targetEnrollmentCodes.has(i.MaPhieuGhiDanh));
  const totalRevenue = targetInvoices.reduce((acc, i) => acc + i.TienThucThu, 0);
  const newStudentsCount = targetEnrollments.length;
  const unpaidInvoices = targetInvoices.filter(i => i.TienConNo > 0);
  const unpaidCount = unpaidInvoices.length;
  const totalOverdueDebt = unpaidInvoices.reduce((acc, i) => acc + i.TienConNo, 0);

  // Compute dynamic overdue list
  const overdueList = unpaidInvoices.slice(0, 15).map((inv, idx) => {
    const student = studentList.find(s => s.MaHV === inv.MaHV);
    const enrollment = enrollmentList.find(e => e.MaPhieuGhiDanh === inv.MaPhieuGhiDanh);
    const cls = classList.find(c => c.MaLop === enrollment?.MaLop);
    return {
      maHoaDon: inv.MaHoaDon,
      maHV: inv.MaHV,
      tenHV: student?.TenHV || 'Học viên',
      sdt: student?.SoDienThoai || '0901234567',
      lop: cls?.TenLop.split(' - ')[0] || 'Lớp học',
      khoa: cls?.TenLop || 'Khóa học',
      tongTien: inv.TongTien,
      conNo: inv.TienConNo,
      quaHan: `${15 + (idx % 20)} ngày`,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportHTML = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>BÁO CÁO HOẠT ĐỘNG KINH DOANH - CÔNG TY CP ĐẦU TƯ GIÁO DỤC KIẾN TRẺ</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 30px; background: #fff; color: #1e293b; }
    .header { background: #064e3b; color: #fff; padding: 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 20px; font-weight: bold; margin-top: 15px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
    .card-title { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .card-val { font-size: 18px; font-weight: bold; margin-top: 5px; color: #0f172a; }
    .card-val.danger { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .badge { background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; margin-top: 50px; }
    .sign-title { font-weight: bold; font-size: 13px; }
    .sign-sub { font-size: 11px; color: #64748b; margin-top: 3px; }
    .sign-name { margin-top: 70px; font-weight: bold; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-weight: 800; font-size: 18px; letter-spacing: 1px;">KIẾN TRẺ EDUCATION</div>
      <div style="font-size: 12px; color: #a7f3d0;">CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ</div>
      <div class="title">BÁO CÁO HOẠT ĐỘNG KINH DOANH & ĐÀO TẠO</div>
      <div style="font-size: 12px; color: #cbd5e1;">Phạm vi: ${activeBranch ? activeBranch.TenChiNhanh : 'Toàn hệ thống 8 Cơ sở'} · Tháng 06/2026</div>
    </div>
    <div style="text-align: right; font-size: 12px;">
      <div style="background: #022c22; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">LOẠI BÁO CÁO: BÁO CÁO TỔNG HỢP</div>
      <div>Ngày lập: Ngày 28 tháng 06 năm 2026</div>
      <div>Giờ lập: 16:40</div>
      <div>Người lập: ${currentUser?.TenNV || 'Nguyễn Thị Kim Anh'} (Mã NV: ${currentUser?.MaNV || 'NV002'})</div>
    </div>
  </div>

  <div class="metrics">
    <div class="card">
      <div class="card-title">Tổng doanh thu</div>
      <div class="card-val">${formatVND(totalRevenue)}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Đã thực thu lũy kế</div>
    </div>
    <div class="card">
      <div class="card-title">Học viên mới</div>
      <div class="card-val">${newStudentsCount}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Đăng ký mới</div>
    </div>
    <div class="card">
      <div class="card-title">Chưa thanh toán</div>
      <div class="card-val">${unpaidCount}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Học viên chưa hoàn tất</div>
    </div>
    <div class="card">
      <div class="card-title">Nợ quá hạn</div>
      <div class="card-val danger">${formatVND(totalOverdueDebt)}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">26 học viên nợ</div>
    </div>
  </div>

  <h3 style="font-size: 14px; margin-top: 30px;">DANH SÁCH HỌC VIÊN CÒN NỢ QUÁ HẠN</h3>
  <table>
    <thead>
      <tr>
        <th>MÃ HV</th>
        <th>HỌ VÀ TÊN</th>
        <th>SỐ ĐIỆN THOẠI</th>
        <th>LỚP HỌC</th>
        <th>KHÓA HỌC</th>
        <th class="text-right">TỔNG TIỀN</th>
        <th class="text-right">CÒN NỢ</th>
        <th style="text-align: center;">QUÁ HẠN</th>
      </tr>
    </thead>
    <tbody>
      ${overdueList
        .map(
          r => `
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: #047857;">${r.maHV}</td>
          <td style="font-weight: 600;">${r.tenHV}</td>
          <td style="font-family: monospace;">${r.sdt}</td>
          <td>${r.lop}</td>
          <td>${r.khoa}</td>
          <td class="text-right" style="font-family: monospace;">${formatVND(r.tongTien)}</td>
          <td class="text-right" style="font-family: monospace; font-weight: bold; color: #dc2626;">${formatVND(r.conNo)}</td>
          <td style="text-align: center;"><span class="badge">${r.quaHan}</span></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div>
      <div class="sign-title">NGƯỜI LẬP BÁO CÁO</div>
      <div class="sign-sub">(Ký, ghi rõ họ tên)</div>
      <div class="sign-name">${currentUser?.TenNV || 'Nguyễn Thị Kim Anh'}</div>
    </div>
    <div>
      <div class="sign-title">KẾ TOÁN TRƯỞNG</div>
      <div class="sign-sub">(Ký, ghi rõ họ tên)</div>
      <div class="sign-name">Lý Hoàng Minh</div>
    </div>
    <div>
      <div class="sign-title">GIÁM ĐỐC ĐIỀU HÀNH</div>
      <div class="sign-sub">(Ký tên và đóng dấu)</div>
      <div class="sign-name">Lý Quang Nghĩa</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCao_HoatDongKinhDoanh_KIENTRE_${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Xem trước Báo cáo Hoạt động Kinh doanh & Đào tạo · KIẾN TRẺ EDU</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHTML}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file HTML</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In trang A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Report View */}
        <div className="p-8 text-slate-800 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <KienTreLogo variant="mark-only" size="md" theme="white" />
                <div>
                  <div className="text-sm font-black tracking-wider uppercase text-emerald-300">
                    KIẾN TRẺ EDUCATION
                  </div>
                  <div className="text-[10px] text-slate-300">
                    CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
                  </div>
                </div>
              </div>
              <h2 className="text-base font-extrabold tracking-wide mt-3 text-white uppercase">
                BÁO CÁO HOẠT ĐỘNG KINH DOANH & ĐÀO TẠO
              </h2>
              <div className="text-xs text-emerald-200">
                Phạm vi: <span className="font-semibold">{activeBranch ? activeBranch.TenChiNhanh : 'Toàn hệ thống 8 Cơ sở'}</span> · Tháng 06/2026
              </div>
            </div>

            <div className="text-right text-xs space-y-1 sm:border-l sm:border-slate-800 sm:pl-6">
              <span className="inline-block px-2 py-0.5 bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 rounded font-semibold text-[10px] mb-1">
                LOẠI BÁO CÁO: BÁO CÁO TỔNG HỢP
              </span>
              <div className="text-[11px] text-slate-300">
                Ngày lập: Ngày 28 tháng 06 năm 2026
              </div>
              <div className="text-[11px] text-slate-400">Giờ lập: 16:40</div>
              <div className="text-[11px] text-slate-300">
                Người lập: <span className="font-semibold text-white">{currentUser?.TenNV || 'Nguyễn Thị Kim Anh'}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">MÃ NV: {currentUser?.MaNV || 'NV002'}</div>
            </div>
          </div>

          {/* 4 Metric Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-500">TỔNG DOANH THU</div>
              <div className="text-sm font-extrabold text-emerald-700 font-mono tabular-nums mt-1">
                {formatVND(totalRevenue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Đã thực thu lũy kế</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-500">HỌC VIÊN MỚI</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                {newStudentsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Đăng ký mới</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-500">CHƯA THANH TOÁN</div>
              <div className="text-sm font-extrabold text-amber-700 font-mono tabular-nums mt-1">
                {unpaidCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Học viên chưa hoàn tất</div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-rose-700">NỢ QUÁ HẠN</div>
              <div className="text-sm font-extrabold text-rose-600 font-mono tabular-nums mt-1">
                {formatVND(totalOverdueDebt)}
              </div>
              <div className="text-[10px] text-rose-500 mt-0.5">26 học viên nợ</div>
            </div>
          </div>

          {/* Overdue Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-2.5 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>DANH SÁCH HỌC VIÊN CÒN NỢ QUÁ HẠN</span>
              <span className="text-[11px] text-rose-600 font-semibold bg-white px-2 py-0.5 rounded border border-rose-200">
                26 học viên
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">MÃ HV</th>
                    <th className="py-2 px-2.5">HỌ VÀ TÊN</th>
                    <th className="py-2 px-2.5 font-mono">SỐ ĐIỆN THOẠI</th>
                    <th className="py-2 px-2.5">LỚP HỌC</th>
                    <th className="py-2 px-2.5">KHÓA HỌC</th>
                    <th className="py-2 px-2.5 text-right font-mono">TỔNG TIỀN</th>
                    <th className="py-2 px-2.5 text-right font-mono">CÒN NỢ</th>
                    <th className="py-2 px-2.5 text-center">QUÁ HẠN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueList.map(r => (
                    <tr key={r.maHoaDon || `${r.maHV}-${r.lop}`} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2.5 font-mono font-bold text-emerald-700">{r.maHV}</td>
                      <td className="py-1.5 px-2.5 font-medium text-slate-900">{r.tenHV}</td>
                      <td className="py-1.5 px-2.5 font-mono text-slate-600">{r.sdt}</td>
                      <td className="py-1.5 px-2.5 font-semibold text-slate-800">{r.lop}</td>
                      <td className="py-1.5 px-2.5 text-slate-600 truncate max-w-[160px]">{r.khoa}</td>
                      <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">{formatVND(r.tongTien)}</td>
                      <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-bold text-rose-600">
                        {formatVND(r.conNo)}
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-semibold">
                          {r.quaHan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 Signatures: Người lập - Kế toán trưởng - Giám đốc */}
          <div className="pt-8 pb-4 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="font-bold text-slate-900 uppercase">NGƯỜI LẬP BÁO CÁO</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900">{currentUser?.TenNV || 'Nguyễn Thị Kim Anh'}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase">KẾ TOÁN TRƯỞNG</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900">Lý Hoàng Minh</div>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase">GIÁM ĐỐC ĐIỀU HÀNH</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký tên và đóng dấu)</div>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-rose-600 font-bold border-2 border-rose-600 border-dashed rounded px-2 py-0.5 rotate-[-8deg] uppercase opacity-75">
                  Đã duyệt · KIẾN TRẺ
                </span>
              </div>
              <div className="font-bold text-slate-900">Lý Quang Nghĩa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

