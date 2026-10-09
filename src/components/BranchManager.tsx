import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChiNhanh } from '../types';
import { formatVND } from '../utils/formatters';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  Building2,
  MapPin,
  Phone,
  UserCheck,
  School,
  Users,
  DollarSign,
  TrendingUp,
  Terminal,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';

export const BranchManager: React.FC = () => {
  const {
    branchList,
    staffList,
    classList,
    enrollmentList,
    invoiceList,
    addBranch,
    updateBranch,
    deleteBranch,
    setActiveTab,
    currentUser,
  } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'KeToan';

  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'HCM' | 'HN' | 'DN'>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Add & Edit
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<ChiNhanh | null>(null);
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<ChiNhanh | null>(null);

  const [formData, setFormData] = useState({
    MaChiNhanh: '',
    TenChiNhanh: '',
    DiaChi: '',
    SoDienThoai: '',
    QuanLyID: staffList[0]?.MaNV || 'NV001',
  });

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({
      MaChiNhanh: '',
      TenChiNhanh: '',
      DiaChi: '',
      SoDienThoai: '028 7300 8888',
      QuanLyID: staffList[0]?.MaNV || 'NV001',
    });
    setShowBranchModal(true);
  };

  const openEditModal = (branch: ChiNhanh) => {
    setEditingBranch(branch);
    setFormData({
      MaChiNhanh: branch.MaChiNhanh,
      TenChiNhanh: branch.TenChiNhanh,
      DiaChi: branch.DiaChi,
      SoDienThoai: branch.SoDienThoai,
      QuanLyID: branch.QuanLyID || staffList[0]?.MaNV || 'NV001',
    });
    setShowBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.TenChiNhanh.trim()) {
      setNotification({ type: 'error', text: 'Tên cơ sở không được để trống!' });
      return;
    }
    if (!formData.DiaChi.trim()) {
      setNotification({ type: 'error', text: 'Địa chỉ cơ sở không được để trống!' });
      return;
    }
    if (!formData.SoDienThoai.trim()) {
      setNotification({ type: 'error', text: 'Số điện thoại liên hệ không được để trống!' });
      return;
    }

    if (editingBranch) {
      const res = updateBranch({
        ...editingBranch,
        TenChiNhanh: formData.TenChiNhanh.trim(),
        DiaChi: formData.DiaChi.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        QuanLyID: formData.QuanLyID,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) setShowBranchModal(false);
    } else {
      const res = addBranch({
        MaChiNhanh: formData.MaChiNhanh.trim() || undefined,
        TenChiNhanh: formData.TenChiNhanh.trim(),
        DiaChi: formData.DiaChi.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        QuanLyID: formData.QuanLyID,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) setShowBranchModal(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmBranch) return;
    const res = deleteBranch(deleteConfirmBranch.MaChiNhanh);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    setDeleteConfirmBranch(null);
  };

  // Compute live statistics per branch directly from DB
  const branchStats = branchList.map(branch => {
    const branchClasses = classList.filter(c => c.MaChiNhanh === branch.MaChiNhanh);
    const branchClassIds = branchClasses.map(c => c.MaLop);

    const branchEnrollments = enrollmentList.filter(
      e => branchClassIds.includes(e.MaLop) && e.TrangThai !== 'Huy'
    );
    const branchEnrollmentCodes = branchEnrollments.map(e => e.MaPhieuGhiDanh);

    const branchInvoices = invoiceList.filter(i => branchEnrollmentCodes.includes(i.MaPhieuGhiDanh));
    const branchCollected = branchInvoices.reduce((acc, i) => acc + i.TienThucThu, 0);
    const branchDebt = branchInvoices.reduce((acc, i) => acc + i.TienConNo, 0);
    const totalBilled = branchCollected + branchDebt;
    const collectionRate = totalBilled > 0 ? Math.round((branchCollected / totalBilled) * 100) : 100;

    const manager = staffList.find(s => s.MaNV === branch.QuanLyID);

    let region: 'HCM' | 'HN' | 'DN' = 'HCM';
    if (branch.DiaChi.toLowerCase().includes('hà nội') || branch.TenChiNhanh.toLowerCase().includes('hà nội') || branch.MaChiNhanh === 'CN07') {
      region = 'HN';
    } else if (branch.DiaChi.toLowerCase().includes('đà nẵng') || branch.TenChiNhanh.toLowerCase().includes('đà nẵng') || branch.MaChiNhanh === 'CN08') {
      region = 'DN';
    }

    return {
      ...branch,
      classesCount: branchClasses.length,
      enrolledCount: branchEnrollments.length,
      revenue: branchCollected,
      debt: branchDebt,
      collectionRate,
      managerName: manager?.TenNV || 'Trần Anh Tuấn',
      managerRole: manager?.BoPhong || 'Ban Giám Đốc',
      managerPhone: manager?.SoDienThoai || branch.SoDienThoai,
      region,
    };
  });

  const filteredBranchStats = branchStats.filter(b => {
    if (selectedRegion === 'ALL') return true;
    return b.region === selectedRegion;
  });

  const totalClasses = branchStats.reduce((acc, b) => acc + b.classesCount, 0);
  const totalEnrolled = branchStats.reduce((acc, b) => acc + b.enrolledCount, 0);
  const totalRevenue = branchStats.reduce((acc, b) => acc + b.revenue, 0);
  const totalDebt = branchStats.reduce((acc, b) => acc + b.debt, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            <span>Quản lý Kinh doanh · Mạng lưới {branchList.length} Cơ sở & Chi nhánh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mạng lưới phủ sóng toàn quốc: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng với đầy đủ chức năng Thêm, Sửa, Xóa cơ sở
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isReadOnly && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm cơ sở mới</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Báo cáo cơ sở</span>
          </button>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Xem và truy vấn bảng ChiNhanh trong SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server (ChiNhanh)</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Quy mô mạng lưới</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{branchList.length} Cơ sở</div>
            <div className="text-[11px] text-slate-500 mt-1">3 Khu vực trọng điểm</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng lớp học mở</div>
            <div className="text-2xl font-black text-indigo-700 mt-0.5">{totalClasses} lớp</div>
            <div className="text-[11px] text-slate-500 mt-1">Phân bổ đều các cơ sở</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Lượt học viên ghi danh</div>
            <div className="text-2xl font-black text-blue-600 mt-0.5">{totalEnrolled} HV</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% cơ sở hoạt động</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-700 font-bold">Tổng doanh thu thực thu</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{formatVND(totalRevenue)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Công nợ tồn: {formatVND(totalDebt)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Region Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-600 px-1">Khu vực:</span>
          {[
            { id: 'ALL' as const, label: `Tất cả (${branchList.length} CS)`, count: branchStats.length },
            { id: 'HCM' as const, label: `TP. Hồ Chí Minh (${branchStats.filter(b => b.region === 'HCM').length} CS)` },
            { id: 'HN' as const, label: `Hà Nội (${branchStats.filter(b => b.region === 'HN').length} CS)` },
            { id: 'DN' as const, label: `Đà Nẵng (${branchStats.filter(b => b.region === 'DN').length} CS)` },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedRegion === r.id
                  ? 'bg-blue-700 text-white shadow-xs font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500">
          Hiển thị <b>{filteredBranchStats.length}</b> / {branchList.length} cơ sở
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredBranchStats.map(branch => (
          <div
            key={branch.MaChiNhanh}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-300 font-bold px-2 py-0.5 bg-blue-900/60 rounded border border-blue-700">
                    {branch.MaChiNhanh}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => openEditModal(branch)}
                          className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white transition cursor-pointer"
                          title="Chỉnh sửa thông tin cơ sở"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmBranch(branch)}
                          className="p-1 hover:bg-rose-500/30 rounded text-slate-300 hover:text-rose-300 transition cursor-pointer"
                          title="Xóa cơ sở"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Hoạt động
                    </span>
                  </div>
                </div>
                <h2 className="text-sm font-bold text-white mt-2 leading-snug line-clamp-1" title={branch.TenChiNhanh}>
                  {branch.TenChiNhanh}
                </h2>
                <div className="text-[11px] text-slate-300 flex items-start gap-1.5 mt-1.5 min-h-[32px] line-clamp-2" title={branch.DiaChi}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{branch.DiaChi}</span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{branch.SoDienThoai}</span>
                </div>
              </div>

              {/* Card Metrics */}
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Lớp học</div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                      {branch.classesCount} lớp
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Học viên</div>
                    <div className="text-sm font-bold text-blue-700 font-mono mt-0.5">
                      {branch.enrolledCount} HV
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Đã thu</div>
                    <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5 truncate" title={formatVND(branch.revenue)}>
                      {formatVND(branch.revenue)}
                    </div>
                  </div>
                </div>

                {/* Collection progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Tiến độ thu nợ</span>
                    <span className="font-bold text-slate-700">{branch.collectionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${branch.collectionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Nợ tồn:</span>
                    <span className="text-rose-600 font-semibold">{formatVND(branch.debt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer - Manager Info */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">
                  Quản lý: <b className="text-slate-800">{branch.managerName}</b>
                </span>
              </div>
              <span className="font-mono text-slate-500 text-[10px] shrink-0">{branch.managerPhone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingBranch ? `Chỉnh sửa thông tin cơ sở (${editingBranch.MaChiNhanh})` : 'Thêm cơ sở / chi nhánh mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowBranchModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-4 text-xs">
              {!editingBranch && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã cơ sở (Tự động hoặc tùy chỉnh):</label>
                  <input
                    type="text"
                    placeholder="Để trống để tự động sinh (VD: CN09)"
                    value={formData.MaChiNhanh}
                    onChange={e => setFormData({ ...formData, MaChiNhanh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên cơ sở / Chi nhánh <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cơ sở 9 - Phú Nhuận (Campus Ngoại Ngữ)"
                  value={formData.TenChiNhanh}
                  onChange={e => setFormData({ ...formData, TenChiNhanh: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa chỉ chi tiết <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 125 Phan Xích Long, Phường 2, Q. Phú Nhuận, TP.HCM"
                  value={formData.DiaChi}
                  onChange={e => setFormData({ ...formData, DiaChi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại hotline <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 028 7300 8888"
                    value={formData.SoDienThoai}
                    onChange={e => setFormData({ ...formData, SoDienThoai: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giám đốc / Quản lý cơ sở:</label>
                  <select
                    value={formData.QuanLyID}
                    onChange={e => setFormData({ ...formData, QuanLyID: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {staffList.map(st => (
                      <option key={st.MaNV} value={st.MaNV}>
                        {st.TenNV} ({st.MaNV} - {st.VaiTro})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingBranch ? 'Lưu thay đổi' : 'Tạo cơ sở mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBranch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Xác nhận xóa cơ sở đào tạo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn xóa cơ sở <b>{deleteConfirmBranch.TenChiNhanh}</b> ({deleteConfirmBranch.MaChiNhanh})?
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
              Lưu ý: Nếu cơ sở đang có các lớp học hoạt động, hệ thống sẽ bảo vệ toàn vẹn dữ liệu và yêu cầu điều chuyển lớp trước khi xóa.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmBranch(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
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

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="ChiNhanh"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
