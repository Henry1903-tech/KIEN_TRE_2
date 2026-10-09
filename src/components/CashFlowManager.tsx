import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhieuThuChi } from '../types';
import { formatVND, formatDate, numberToWordsVietnamese } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Printer,
  Edit2,
  Trash2,
  Save,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Terminal,
} from 'lucide-react';

export const CashFlowManager: React.FC = () => {
  const { cashFlowList, branchList, currentUser, addCashFlow, updateCashFlow, deleteCashFlow } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'Thu' | 'Chi'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [entryType, setEntryType] = useState<'Thu' | 'Chi'>('Thu');
  const [hangMuc, setHangMuc] = useState<PhieuThuChi['HangMuc']>('ThuHocPhi');
  const [tenHangMuc, setTenHangMuc] = useState('');
  const [soTien, setSoTien] = useState<number>(0);
  const [hinhThuc, setHinhThuc] = useState<'TienMat' | 'ChuyenKhoan'>('ChuyenKhoan');
  const [nguoiGiaoDich, setNguoiGiaoDich] = useState('');
  const [maChiNhanh, setMaChiNhanh] = useState('CN01');
  const [chungTuGoc, setChungTuGoc] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  // Edit modal state
  const [editingVoucher, setEditingVoucher] = useState<PhieuThuChi | null>(null);
  const [deleteConfirmVoucher, setDeleteConfirmVoucher] = useState<PhieuThuChi | null>(null);

  // Official Voucher Print Modal
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuThuChi | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Financial Calculations
  const totalThu = cashFlowList
    .filter(i => i.Loai === 'Thu')
    .reduce((sum, item) => sum + item.SoTien, 0);

  const totalChi = cashFlowList
    .filter(i => i.Loai === 'Chi')
    .reduce((sum, item) => sum + item.SoTien, 0);

  const netCashFlow = totalThu - totalChi;

  const cashBalance = cashFlowList
    .filter(i => i.HinhThuc === 'TienMat')
    .reduce((sum, i) => sum + (i.Loai === 'Thu' ? i.SoTien : -i.SoTien), 0);

  const bankBalance = cashFlowList
    .filter(i => i.HinhThuc === 'ChuyenKhoan')
    .reduce((sum, i) => sum + (i.Loai === 'Thu' ? i.SoTien : -i.SoTien), 0);

  // Filtered List
  const filteredList = cashFlowList.filter(item => {
    if (activeTab !== 'all' && item.Loai !== activeTab) return false;
    if (selectedBranch !== 'all' && item.MaChiNhanh !== selectedBranch) return false;
    if (selectedMethod !== 'all' && item.HinhThuc !== selectedMethod) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchCode = item.MaPhieuTC.toLowerCase().includes(searchLower);
    const matchDesc = item.TenHangMuc.toLowerCase().includes(searchLower);
    const matchPerson = item.NguoiGiaoDich.toLowerCase().includes(searchLower);

    return matchCode || matchDesc || matchPerson;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (soTien <= 0) {
      setNotification({ type: 'error', text: 'Số tiền thu / chi phải lớn hơn 0 VNĐ!' });
      return;
    }
    if (!tenHangMuc.trim()) {
      setNotification({ type: 'error', text: 'Vui lòng nhập nội dung diễn giải thu chi!' });
      return;
    }
    if (!nguoiGiaoDich.trim()) {
      setNotification({ type: 'error', text: 'Vui lòng nhập họ tên người giao dịch (người nộp hoặc người nhận)!' });
      return;
    }

    const res = addCashFlow({
      Loai: entryType,
      HangMuc: hangMuc,
      TenHangMuc: tenHangMuc.trim(),
      SoTien: Number(soTien),
      HinhThuc: hinhThuc,
      NguoiGiaoDich: nguoiGiaoDich.trim(),
      MaChiNhanh: maChiNhanh,
      ChungTuGoc: chungTuGoc.trim() || undefined,
      GhiChu: ghiChu.trim() || undefined,
    });

    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setShowCreateModal(false);
      // Reset form
      setSoTien(0);
      setTenHangMuc('');
      setNguoiGiaoDich('');
      setChungTuGoc('');
      setGhiChu('');
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;
    if (editingVoucher.SoTien <= 0) {
      setNotification({ type: 'error', text: 'Số tiền thu / chi phải lớn hơn 0 VNĐ!' });
      return;
    }
    const res = updateCashFlow(editingVoucher);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) setEditingVoucher(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmVoucher) return;
    const res = deleteCashFlow(deleteConfirmVoucher.MaPhieuTC);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    setDeleteConfirmVoucher(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Quản lý Sổ Quỹ Thu - Chi & Tài chính
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi dòng tiền thực tế, phiếu thu học phí, chi trả lương giảng viên và chi phí vận hành chi nhánh
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Xem và truy vấn bảng SoQuyThuChi trong CSDL SQL Server"
            >
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>SQL Server (SoQuyThuChi)</span>
            </button>
          )}
          <button
            onClick={() => {
              setEntryType('Thu');
              setHangMuc('ThuHocPhi');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Lập Phiếu Thu
          </button>
          <button
            onClick={() => {
              setEntryType('Chi');
              setHangMuc('ChiLuongGiangVien');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lập Phiếu Chi
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

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenues */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Tổng Thu Thực Tế
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-2">{formatVND(totalThu)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Học phí & Doanh thu giáo trình</div>
        </div>

        {/* Total Expenditures */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Tổng Chi Hoạt Động
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-600 mt-2">{formatVND(totalChi)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lương GV, mặt bằng & marketing</div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Dòng Tiền Ròng (Thu - Chi)</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                netCashFlow >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl font-extrabold mt-2 ${
              netCashFlow >= 0 ? 'text-blue-700' : 'text-amber-600'
            }`}
          >
            {formatVND(netCashFlow)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Lợi nhuận ròng vận hành</div>
        </div>

        {/* Cash vs Bank */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Tồn Quỹ Theo Kênh</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiền mặt tại quỹ:</span>
              <span className="font-bold text-slate-800">{formatVND(cashBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngân hàng (Vietcombank):</span>
              <span className="font-bold text-blue-700">{formatVND(bankBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'all' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({cashFlowList.length})
            </button>
            <button
              onClick={() => setActiveTab('Thu')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'Thu'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thu tiền ({cashFlowList.filter(i => i.Loai === 'Thu').length})
            </button>
            <button
              onClick={() => setActiveTab('Chi')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'Chi'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chi tiền ({cashFlowList.filter(i => i.Loai === 'Chi').length})
            </button>
          </div>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Tất cả chi nhánh</option>
            {branchList.map(b => (
              <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                {b.TenChiNhanh}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Mọi hình thức</option>
            <option value="ChuyenKhoan">Chuyển khoản</option>
            <option value="TienMat">Tiền mặt</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã phiếu, nội dung, người nộp/nhận..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Cash Flow Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Mã phiếu</th>
                <th className="px-4 py-3">Loại & Thời gian</th>
                <th className="px-4 py-3">Nội dung chi tiết</th>
                <th className="px-4 py-3">Người giao dịch</th>
                <th className="px-4 py-3">Hình thức & Chi nhánh</th>
                <th className="px-4 py-3 text-right">Số tiền (VNĐ)</th>
                <th className="px-4 py-3 text-center">Chứng từ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy phiếu thu/chi nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const branch = branchList.find(b => b.MaChiNhanh === item.MaChiNhanh);

                  return (
                    <tr key={item.MaPhieuTC} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.MaPhieuTC}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.Loai === 'Thu'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.Loai === 'Thu' ? 'PHIẾU THU' : 'PHIẾU CHI'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.NgayGiaoDich}</div>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-semibold text-slate-900">{item.TenHangMuc}</div>
                        {item.GhiChu && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">{item.GhiChu}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{item.NguoiGiaoDich}</div>
                        <div className="text-[10px] text-slate-400">NV lập: {item.NhanVienThucHien}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          {item.HinhThuc === 'ChuyenKhoan' ? (
                            <CreditCard className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Banknote className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>{item.HinhThuc === 'ChuyenKhoan' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{branch?.TenChiNhanh || item.MaChiNhanh}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.Loai === 'Thu' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {item.Loai === 'Thu' ? '+' : '-'}
                          {formatVND(item.SoTien)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedVoucher(item)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="In chứng từ phiếu thu/chi"
                          >
                            <Printer className="w-3 h-3" />
                            <span>In</span>
                          </button>

                          <button
                            onClick={() => setEditingVoucher(item)}
                            className="p-1 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded transition cursor-pointer"
                            title="Chỉnh sửa phiếu thu/chi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmVoucher(item)}
                            className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded transition cursor-pointer"
                            title="Xóa phiếu thu/chi"
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

      {/* CREATE INCOME / EXPENSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div
              className={`px-6 py-4 text-white flex items-center justify-between ${
                entryType === 'Thu' ? 'bg-emerald-800' : 'bg-rose-800'
              }`}
            >
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-white" />
                  {entryType === 'Thu' ? 'Lập Phiếu Thu Tiền' : 'Lập Phiếu Chi Tiền'}
                </h3>
                <div className="text-xs text-white/80">KIẾN TRẺ - Kế toán & Sổ quỹ nội bộ</div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-6 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('Thu');
                    setHangMuc('ThuHocPhi');
                  }}
                  className={`py-2 rounded-lg font-bold border transition-all ${
                    entryType === 'Thu'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  + Phiếu Thu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('Chi');
                    setHangMuc('ChiLuongGiangVien');
                  }}
                  className={`py-2 rounded-lg font-bold border transition-all ${
                    entryType === 'Chi'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  - Phiếu Chi
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hạng mục thu/chi *</label>
                <select
                  value={hangMuc}
                  onChange={e => setHangMuc(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {entryType === 'Thu' ? (
                    <>
                      <option value="ThuHocPhi">Thu học phí học viên</option>
                      <option value="ChiKhac">Thu lệ phí thi thử / Giáo trình</option>
                    </>
                  ) : (
                    <>
                      <option value="ChiLuongGiangVien">Chi thù lao giảng viên / Trợ giảng</option>
                      <option value="ChiThueMatBang">Chi tiền thuê mặt bằng cơ sở</option>
                      <option value="ChiMarketing">Chi quảng cáo Facebook/Google Tuyển sinh</option>
                      <option value="ChiGiaoTrinh">Chi in ấn giáo trình / Tài liệu học tập</option>
                      <option value="ChiDienNuocCS">Chi điện nước, Internet, vệ sinh cơ sở</option>
                      <option value="ChiKhac">Chi phí văn phòng phẩm & khác</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <input
                  type="text"
                  value={tenHangMuc}
                  onChange={e => setTenHangMuc(e.target.value)}
                  placeholder={
                    entryType === 'Thu'
                      ? 'VD: Thu học phí trọn gói khóa K001 - Học viên Trần Minh Huy'
                      : 'VD: Chi thù lao 45 giờ giảng dạy Tháng 6 - GV TS. Lâm Hoàng Trúc Mai'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                <input
                  type="number"
                  min={1000}
                  step={10000}
                  value={soTien || ''}
                  onChange={e => setSoTien(Number(e.target.value))}
                  placeholder="Nhập số tiền..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
                {soTien > 0 && (
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    Bằng chữ: <strong>{numberToWordsVietnamese(soTien)}</strong>
                  </div>
                )}
              </div>

              {/* Person & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {entryType === 'Thu' ? 'Người nộp tiền *' : 'Người nhận tiền *'}
                  </label>
                  <input
                    type="text"
                    value={nguoiGiaoDich}
                    onChange={e => setNguoiGiaoDich(e.target.value)}
                    placeholder="Họ và tên..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chi nhánh hạch toán *</label>
                  <select
                    value={maChiNhanh}
                    onChange={e => setMaChiNhanh(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {branchList.map(b => (
                      <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                        {b.TenChiNhanh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method & Original Doc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức thanh toán</label>
                  <select
                    value={hinhThuc}
                    onChange={e => setHinhThuc(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="ChuyenKhoan">Chuyển khoản (Vietcombank)</option>
                    <option value="TienMat">Tiền mặt tại quỹ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số chứng từ gốc kèm theo</label>
                  <input
                    type="text"
                    value={chungTuGoc}
                    onChange={e => setChungTuGoc(e.target.value)}
                    placeholder="Hóa đơn / Giấy đề nghị..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg font-semibold shadow-xs cursor-pointer ${
                    entryType === 'Thu' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Lưu & Hạch toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VOUCHER MODAL */}
      {editingVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Chỉnh sửa phiếu {editingVoucher.MaPhieuTC} ({editingVoucher.Loai === 'Thu' ? 'Phiếu thu' : 'Phiếu chi'})</h3>
              </div>
              <button
                onClick={() => setEditingVoucher(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung diễn giải *</label>
                <input
                  type="text"
                  required
                  value={editingVoucher.TenHangMuc}
                  onChange={e => setEditingVoucher({ ...editingVoucher, TenHangMuc: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={editingVoucher.SoTien}
                  onChange={e => setEditingVoucher({ ...editingVoucher, SoTien: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người giao dịch *</label>
                  <input
                    type="text"
                    required
                    value={editingVoucher.NguoiGiaoDich}
                    onChange={e => setEditingVoucher({ ...editingVoucher, NguoiGiaoDich: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cơ sở chi nhánh</label>
                  <select
                    value={editingVoucher.MaChiNhanh}
                    onChange={e => setEditingVoucher({ ...editingVoucher, MaChiNhanh: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {branchList.map(b => (
                      <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                        {b.TenChiNhanh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức thanh toán</label>
                  <select
                    value={editingVoucher.HinhThuc}
                    onChange={e => setEditingVoucher({ ...editingVoucher, HinhThuc: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="ChuyenKhoan">Chuyển khoản</option>
                    <option value="TienMat">Tiền mặt</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    value={editingVoucher.GhiChu || ''}
                    onChange={e => setEditingVoucher({ ...editingVoucher, GhiChu: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVoucher(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy bỏ
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

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmVoucher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Xác nhận xóa phiếu thu/chi</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn xóa phiếu <b>{deleteConfirmVoucher.MaPhieuTC}</b> ({formatVND(deleteConfirmVoucher.SoTien)}) khỏi sổ quỹ?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmVoucher(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL VOUCHER PRINT MODAL (PHIẾU THU / PHIẾU CHI - MẪU CHUẨN BTC) */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden my-6">
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="font-bold text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-400" />
                Chứng từ Kế toán: {selectedVoucher.Loai === 'Thu' ? 'PHIẾU THU' : 'PHIẾU CHI'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  In chứng từ
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-8 text-slate-900 font-sans text-xs space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                <div>
                  <div className="font-bold text-[11px] uppercase text-emerald-900">
                    CÔNG TY CỔ PHẦN ĐẦU TƯ GIÁO DỤC KIẾN TRẺ
                  </div>
                  <div className="text-[10px] text-slate-600">Mã số thuế: 0318268688</div>
                  <div className="text-[10px] text-slate-600">158 Hoàng Hoa Thám, P. 12, Q. Tân Bình, TP.HCM</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[11px]">
                    {selectedVoucher.Loai === 'Thu' ? 'Mẫu số 01 - TT' : 'Mẫu số 02 - TT'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    (Ban hành theo TT số 200/2014/TT-BTC)
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-800 mt-1">
                    Số: {selectedVoucher.MaPhieuTC}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  {selectedVoucher.Loai === 'Thu' ? 'PHIẾU THU TIỀN' : 'PHIẾU CHI TIỀN'}
                </h2>
                <div className="text-[11px] italic text-slate-500">
                  Thời gian hạch toán: {selectedVoucher.NgayGiaoDich}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 border-y border-slate-200 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {selectedVoucher.Loai === 'Thu' ? 'Họ và tên người nộp tiền:' : 'Họ và tên người nhận tiền:'}
                  </span>
                  <span className="font-bold text-slate-900">{selectedVoucher.NguoiGiaoDich}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Địa chỉ / Đơn vị:</span>
                  <span className="text-slate-800">
                    {branchList.find(b => b.MaChiNhanh === selectedVoucher.MaChiNhanh)?.DiaChi ||
                      'TP. Hồ Chí Minh'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Lý do thu / chi:</span>
                  <span className="font-medium text-slate-900 text-right max-w-xs">
                    {selectedVoucher.TenHangMuc}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-600 font-bold">Số tiền:</span>
                  <span className="font-mono font-extrabold text-base text-blue-900">
                    {formatVND(selectedVoucher.SoTien)}
                  </span>
                </div>
                <div className="text-[11px] italic text-slate-600">
                  (Viết bằng chữ: {numberToWordsVietnamese(selectedVoucher.SoTien)})
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Hình thức: {selectedVoucher.HinhThuc === 'ChuyenKhoan' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
                  <span>Kèm theo: {selectedVoucher.ChungTuGoc || '01 chứng từ gốc'}</span>
                </div>
              </div>

              {/* Signatures: 5 positions */}
              <div className="grid grid-cols-5 gap-2 pt-4 text-center text-[10px]">
                <div>
                  <div className="font-bold uppercase">Giám đốc</div>
                  <div className="italic text-slate-400">(Ký, họ tên, dấu)</div>
                  <div className="h-14 flex items-end justify-center font-bold text-slate-800">
                    TS. Lâm Hoàng Trúc Mai
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase">Kế toán trưởng</div>
                  <div className="italic text-slate-400">(Ký, họ tên)</div>
                  <div className="h-14 flex items-end justify-center font-semibold text-slate-700">
                    Lê Thị Mỹ Linh
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase">Người nộp/nhận</div>
                  <div className="italic text-slate-400">(Ký, họ tên)</div>
                  <div className="h-14 flex items-end justify-center font-semibold text-slate-700 truncate">
                    {selectedVoucher.NguoiGiaoDich}
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase">Người lập phiếu</div>
                  <div className="italic text-slate-400">(Ký, họ tên)</div>
                  <div className="h-14 flex items-end justify-center font-semibold text-slate-700">
                    {currentUser?.TenNV || 'Trần Anh Tuấn'}
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase">Thủ quỹ</div>
                  <div className="italic text-slate-400">(Ký, họ tên)</div>
                  <div className="h-14 flex items-end justify-center font-semibold text-slate-700">
                    Nguyễn Thu Hà
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* SQL Server Data Workbench Modal */}
      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="SoQuyThuChi"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
