import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KhachHangTiemNang } from '../types';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  UserPlus,
  Search,
  Filter,
  Flame,
  PhoneCall,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building2,
  Plus,
  Trash2,
  Terminal,
} from 'lucide-react';

export const CrmLeadManager: React.FC = () => {
  const { leadList, addLead, updateLead, deleteLead, convertLeadToEnrollment, classList, courseList, staffList, currentUser } = useApp();

  const isReadOnly = currentUser?.VaiTro === 'KeToan';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPotential, setFilterPotential] = useState<string>('all');
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const [selectedLead, setSelectedLead] = useState<KhachHangTiemNang | null>(null);
  const [deleteTargetLead, setDeleteTargetLead] = useState<KhachHangTiemNang | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Conversion Modal State
  const [convertingLead, setConvertingLead] = useState<KhachHangTiemNang | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');

  const [formData, setFormData] = useState({
    MaLead: '',
    HoTen: '',
    SoDienThoai: '',
    Email: '',
    KhoaHocQuanTam: courseList[0]?.TenKH || 'B1 IELTS Preparation',
    Nguon: 'Facebook' as KhachHangTiemNang['Nguon'],
    MucDoTiemNang: 'Cần học gấp' as KhachHangTiemNang['MucDoTiemNang'],
    TrangThai: 'Moi' as KhachHangTiemNang['TrangThai'],
    NhanVienPhuTrach: currentUser?.MaNV || 'NV004',
    LichHenTuVan: '',
    GhiChu: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setSelectedLead(null);
    setFormData({
      MaLead: '',
      HoTen: '',
      SoDienThoai: '',
      Email: '',
      KhoaHocQuanTam: courseList[0]?.TenKH || 'B1 IELTS Preparation',
      Nguon: 'Facebook',
      MucDoTiemNang: 'Cần học gấp',
      TrangThai: 'Moi',
      NhanVienPhuTrach: currentUser?.MaNV || 'NV004',
      LichHenTuVan: '',
      GhiChu: '',
    });
  };

  const handleSelectLead = (lead: KhachHangTiemNang) => {
    setSelectedLead(lead);
    setIsEditing(true);
    setFormData({
      MaLead: lead.MaLead,
      HoTen: lead.HoTen,
      SoDienThoai: lead.SoDienThoai,
      Email: lead.Email || '',
      KhoaHocQuanTam: lead.KhoaHocQuanTam,
      Nguon: lead.Nguon,
      MucDoTiemNang: lead.MucDoTiemNang,
      TrangThai: lead.TrangThai,
      NhanVienPhuTrach: lead.NhanVienPhuTrach,
      LichHenTuVan: lead.LichHenTuVan || '',
      GhiChu: lead.GhiChu || '',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.HoTen.trim()) {
      setNotification({ type: 'error', text: 'Họ tên khách hàng không được để trống!' });
      return;
    }
    if (!formData.SoDienThoai.trim()) {
      setNotification({ type: 'error', text: 'Số điện thoại không được để trống!' });
      return;
    }

    if (isEditing && selectedLead) {
      const res = updateLead({
        ...selectedLead,
        HoTen: formData.HoTen.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        Email: formData.Email.trim() || undefined,
        KhoaHocQuanTam: formData.KhoaHocQuanTam,
        Nguon: formData.Nguon,
        MucDoTiemNang: formData.MucDoTiemNang,
        TrangThai: formData.TrangThai,
        NhanVienPhuTrach: formData.NhanVienPhuTrach,
        LichHenTuVan: formData.LichHenTuVan || undefined,
        GhiChu: formData.GhiChu.trim() || undefined,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    } else {
      const res = addLead({
        HoTen: formData.HoTen.trim(),
        SoDienThoai: formData.SoDienThoai.trim(),
        Email: formData.Email.trim() || undefined,
        KhoaHocQuanTam: formData.KhoaHocQuanTam,
        Nguon: formData.Nguon,
        MucDoTiemNang: formData.MucDoTiemNang,
        TrangThai: formData.TrangThai,
        NhanVienPhuTrach: formData.NhanVienPhuTrach,
        LichHenTuVan: formData.LichHenTuVan || undefined,
        GhiChu: formData.GhiChu.trim() || undefined,
      });
      setNotification({ type: res.success ? 'success' : 'error', text: res.message });
      if (res.success) resetForm();
    }
  };

  const handleExecuteConversion = () => {
    if (!convertingLead || !targetClassId) {
      setNotification({ type: 'error', text: 'Vui lòng chọn lớp học để xếp lớp cho học viên!' });
      return;
    }

    const res = convertLeadToEnrollment(convertingLead.MaLead, targetClassId);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    setConvertingLead(null);
  };

  const handleConfirmDeleteLead = () => {
    if (!deleteTargetLead) return;
    const res = deleteLead(deleteTargetLead.MaLead);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (selectedLead?.MaLead === deleteTargetLead.MaLead) {
      resetForm();
    }
    setDeleteTargetLead(null);
  };

  const filteredLeads = leadList.filter(l => {
    const kw = searchKeyword.toLowerCase();
    const matchesKeyword =
      l.HoTen.toLowerCase().includes(kw) ||
      l.SoDienThoai.includes(kw) ||
      l.KhoaHocQuanTam.toLowerCase().includes(kw);
    const matchesStatus = filterStatus === 'all' || l.TrangThai === filterStatus;
    const matchesPotential =
      filterPotential === 'all' ||
      l.MucDoTiemNang === filterPotential ||
      (filterPotential === 'Cần học gấp' && l.MucDoTiemNang === 'Nong') ||
      (filterPotential === 'Đang cân nhắc' && l.MucDoTiemNang === 'Am') ||
      (filterPotential === 'Hỏi tham khảo thông tin' && l.MucDoTiemNang === 'Lanh');
    return matchesKeyword && matchesStatus && matchesPotential;
  });

  const availableClasses = classList.filter(c => c.TrangThai === 'DangChieuSinh');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <span>Quản lý Kinh doanh & Leads Tư vấn (CRM)</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Tiếp nhận khách hàng tiềm năng, theo dõi tiến trình tư vấn và chuyển đổi thành học viên
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, SĐT, khóa học..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {currentUser?.VaiTro === 'Admin' && (
            <button
              onClick={() => setShowSqlWorkbench(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              title="Xem và truy vấn bảng KhachHangTiemNang trong SQL Server"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Server</span>
            </button>
          )}

          {!isReadOnly && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tiếp nhận Lead</span>
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>Phân quyền Kế toán: Bạn có quyền xem danh sách khách hàng tiềm năng và khuyến mãi để phục vụ kiểm tra điều kiện áp dụng học phí.</span>
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

      {/* Top 3 Metric Summary for Business Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500">Tổng số Lead tiếp nhận</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">{leadList.length} khách hàng</div>
          <div className="text-[11px] text-slate-400 mt-1">Từ các kênh Facebook, Website, Workshop</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500">Mức độ Cần học gấp (Ưu tiên chốt)</div>
          <div className="text-xl font-bold text-rose-600 font-mono mt-1">
            {leadList.filter(l => l.MucDoTiemNang === 'Cần học gấp' || l.MucDoTiemNang === 'Nong').length} khách hàng
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cần liên hệ chốt trong 24 giờ</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500">Đã chuyển đổi thành công</div>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-1">
            {leadList.filter(l => l.TrangThai === 'DaChuyenDoi').length} học viên
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tỷ lệ chuyển đổi: ~45%</div>
        </div>
      </div>

      {/* Form Container (Thêm/Sửa Lead) - Only for Admin & GiaoVu */}
      {!isReadOnly && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>{isEditing ? 'Cập nhật thông tin Lead Tư vấn' : 'Tiếp nhận Khách hàng tiềm năng mới'}</span>
            {isEditing && <span className="text-blue-700 font-mono font-bold">({selectedLead?.MaLead})</span>}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Họ và tên khách hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.HoTen}
                onChange={e => setFormData({ ...formData, HoTen: e.target.value })}
                placeholder="Ví dụ: Nguyễn Hải Đăng"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.SoDienThoai}
                onChange={e => setFormData({ ...formData, SoDienThoai: e.target.value })}
                placeholder="09xxxxxxxx"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.Email}
                onChange={e => setFormData({ ...formData, Email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Khóa học quan tâm
              </label>
              <select
                value={formData.KhoaHocQuanTam}
                onChange={e => setFormData({ ...formData, KhoaHocQuanTam: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {courseList.map(c => (
                  <option key={c.MaKH} value={c.TenKH}>
                    {c.TenKH}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nguồn khách hàng
              </label>
              <select
                value={formData.Nguon}
                onChange={e => setFormData({ ...formData, Nguon: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Facebook">Facebook Ads / Fanpage</option>
                <option value="Website">Website kientre.edu.vn</option>
                <option value="GioiThieu">Người quen giới thiệu</option>
                <option value="TrucTiep">Đến trực tiếp văn phòng</option>
                <option value="Workshop">Workshop / Sự kiện</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mức độ tiềm năng
              </label>
              <select
                value={formData.MucDoTiemNang}
                onChange={e => setFormData({ ...formData, MucDoTiemNang: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Cần học gấp">🔥 Cần học gấp (Quyết định ngay, cần lớp gấp)</option>
                <option value="Đang cân nhắc">⚡ Đang cân nhắc (Xem xét lịch học & học phí)</option>
                <option value="Hỏi tham khảo thông tin">❄️ Hỏi tham khảo thông tin (Tìm hiểu chương trình)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Trạng thái tư vấn
              </label>
              <select
                value={formData.TrangThai}
                onChange={e => setFormData({ ...formData, TrangThai: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Moi">Mới tiếp nhận</option>
                <option value="DangTuVan">Đang tư vấn</option>
                <option value="DaHenLich">Đã hẹn lịch test / tư vấn</option>
                <option value="DaChuyenDoi">Đã chuyển đổi thành học viên</option>
                <option value="Huy">Hủy tư vấn</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nhân viên phụ trách
              </label>
              <select
                value={formData.NhanVienPhuTrach}
                onChange={e => setFormData({ ...formData, NhanVienPhuTrach: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {staffList.map(s => (
                  <option key={s.MaNV} value={s.MaNV}>
                    {s.MaNV} - {s.TenNV} ({s.BoPhong})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Lịch hẹn tư vấn (Nếu có)
              </label>
              <input
                type="text"
                value={formData.LichHenTuVan}
                onChange={e => setFormData({ ...formData, LichHenTuVan: e.target.value })}
                placeholder="Ví dụ: 09:30 sáng Thứ 7 tại CS1"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ghi chú nhu cầu khách hàng
              </label>
              <input
                type="text"
                value={formData.GhiChu}
                onChange={e => setFormData({ ...formData, GhiChu: e.target.value })}
                placeholder="Mục tiêu điểm số, ca học mong muốn..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            {isEditing && selectedLead && (
              <button
                type="button"
                onClick={() => setDeleteTargetLead(selectedLead)}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Lead</span>
              </button>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              {isEditing ? 'Lưu thay đổi' : 'Lưu Lead mới'}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-800">
            Danh sách khách hàng tiềm năng ({filteredLeads.length})
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Moi">Mới tiếp nhận</option>
                <option value="DangTuVan">Đang tư vấn</option>
                <option value="DaHenLich">Đã hẹn lịch</option>
                <option value="DaChuyenDoi">Đã chuyển đổi</option>
                <option value="Huy">Hủy</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
              <Flame className="w-3 h-3 text-rose-500" />
              <select
                value={filterPotential}
                onChange={e => setFilterPotential(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="Cần học gấp">Cần học gấp</option>
                <option value="Đang cân nhắc">Đang cân nhắc</option>
                <option value="Hỏi tham khảo thông tin">Hỏi tham khảo thông tin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mã Lead</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Số ĐT</th>
                <th className="py-2.5 px-3">Khóa học quan tâm</th>
                <th className="py-2.5 px-3">Nguồn</th>
                <th className="py-2.5 px-3 text-center">Tiềm năng</th>
                <th className="py-2.5 px-3">Phụ trách</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Chuyển đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map(l => {
                const staff = staffList.find(s => s.MaNV === l.NhanVienPhuTrach);
                const isSelected = selectedLead?.MaLead === l.MaLead;
                const isUrgent = l.MucDoTiemNang === 'Cần học gấp' || l.MucDoTiemNang === 'Nong';
                const isConsidering = l.MucDoTiemNang === 'Đang cân nhắc' || l.MucDoTiemNang === 'Am';

                return (
                  <tr
                    key={l.MaLead}
                    onClick={() => handleSelectLead(l)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{l.MaLead}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{l.HoTen}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{l.SoDienThoai}</td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-[160px] truncate">
                      {l.KhoaHocQuanTam}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{l.Nguon}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800'
                            : isConsidering
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isUrgent
                          ? 'CẦN HỌC GẤP'
                          : isConsidering
                          ? 'ĐANG CÂN NHẮC'
                          : 'HỎI THAM KHẢO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{staff ? staff.TenNV : l.NhanVienPhuTrach}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          l.TrangThai === 'DaChuyenDoi'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : l.TrangThai === 'DangTuVan'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : l.TrangThai === 'DaHenLich'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {l.TrangThai}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isReadOnly ? (
                          <span className="text-[11px] text-slate-400 font-medium">Chỉ xem</span>
                        ) : (
                          <>
                            {l.TrangThai !== 'DaChuyenDoi' ? (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setConvertingLead(l);
                                  setTargetClassId(availableClasses[0]?.MaLop || '');
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Chốt ghi danh</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-semibold">Đã thành học viên</span>
                            )}

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteTargetLead(l);
                              }}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Xóa khách hàng tiềm năng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Modal Chuyển đổi Lead sang Học viên & Xếp lớp */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Chốt tuyển sinh: Chuyển đổi Lead sang Lớp học</span>
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>
                Khách hàng: <span className="font-bold text-slate-900">{convertingLead.HoTen}</span>
              </div>
              <div>
                SĐT: <span className="font-mono">{convertingLead.SoDienThoai}</span> · Khóa quan tâm:{' '}
                <span className="text-blue-700 font-semibold">{convertingLead.KhoaHocQuanTam}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn lớp học đang chiêu sinh để ghi danh:
              </label>
              <select
                value={targetClassId}
                onChange={e => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {availableClasses.map(cls => (
                  <option key={cls.MaLop} value={cls.MaLop}>
                    {cls.TenLop} ({cls.MaLop} - Sĩ số: {cls.SoLuongDaDangKy}/{cls.SucChuaToiDa})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                * Hành động này sẽ tự động thêm học viên vào danh bạ, lập phiếu ghi danh chính thức và tạo hóa đơn học phí tương ứng.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteConversion}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Xác nhận chuyển đổi & Xếp lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa Lead */}
      {deleteTargetLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa khách hàng tiềm năng</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc chắn muốn xóa khách hàng <b>{deleteTargetLead.HoTen}</b> ({deleteTargetLead.MaLead}) khỏi CRM?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTargetLead(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLead}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
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
          initialTable="KhachHangTiemNang"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
