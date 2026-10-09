import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThongBao } from '../types';
import { SqlServerWorkbenchModal } from './SqlServerWorkbenchModal';
import {
  BellRing,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Trash2,
  Terminal,
} from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const { notificationList, studentList, classList, sendNotification, deleteNotification, currentUser } = useApp();

  const [formData, setFormData] = useState({
    TieuDe: '',
    NoiDung: '',
    Loai: 'LichHoc' as ThongBao['Loai'],
    NguoiNhan: studentList[0]?.TenHV || 'Học viên',
    KenhGui: 'Zalo' as ThongBao['KenhGui'],
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteTargetNotif, setDeleteTargetNotif] = useState<ThongBao | null>(null);
  const [showSqlWorkbench, setShowSqlWorkbench] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.TieuDe.trim()) {
      setNotification({ type: 'error', text: 'Tiêu đề thông báo không được để trống!' });
      return;
    }
    if (!formData.NoiDung.trim()) {
      setNotification({ type: 'error', text: 'Nội dung thông báo không được để trống!' });
      return;
    }

    const res = sendNotification(formData);
    setNotification({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      setFormData({
        TieuDe: '',
        NoiDung: '',
        Loai: 'LichHoc',
        NguoiNhan: studentList[0]?.TenHV || 'Học viên',
        KenhGui: 'Zalo',
      });
    }
  };

  const handleTemplate = (type: 'LichHoc' | 'HocPhi' | 'DiemSo') => {
    if (type === 'LichHoc') {
      setFormData(prev => ({
        ...prev,
        Loai: 'LichHoc',
        TieuDe: 'Thông báo lịch khai giảng lớp học mới',
        NoiDung: 'Chào bạn, lớp học tại KIẾN TRẺ EDU sẽ chính thức bắt đầu vào lúc 18:00 tuần tới tại phòng học đã đăng ký. Vui lòng đến trước 15 phút.',
      }));
    } else if (type === 'HocPhi') {
      setFormData(prev => ({
        ...prev,
        Loai: 'HocPhi',
        TieuDe: 'Nhắc lịch thanh toán học phí đợt tiếp theo',
        NoiDung: 'Công ty CP Đầu tư Giáo dục KIẾN TRẺ xin thông báo đến quý học viên lịch nộp học phí đợt 2 theo quy định. Bạn có thể chuyển khoản qua VietQR hoặc đóng tại quầy kế toán.',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        Loai: 'DiemSo',
        TieuDe: 'Bảng điểm và kết quả đánh giá cuối khóa',
        NoiDung: 'Giảng viên đã hoàn tất chấm điểm thi cuối khóa. Điểm số và nhận xét chi tiết đã được cập nhật vào hồ sơ học tập của bạn tại trung tâm KIẾN TRẺ.',
      }));
    }
  };

  const filtered = notificationList.filter(n => {
    const kw = searchKeyword.toLowerCase();
    return (
      n.TieuDe.toLowerCase().includes(kw) ||
      n.NoiDung.toLowerCase().includes(kw) ||
      n.NguoiNhan.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-700" />
            <span>Trung tâm Thông báo Tự động (Zalo OA, SMS, Email)</span>
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Gửi lịch khai giảng, nhắc hạn nộp học phí và gửi bảng điểm kết quả đào tạo KIẾN TRẺ
          </div>
        </div>

        {currentUser?.VaiTro === 'Admin' && (
          <button
            onClick={() => setShowSqlWorkbench(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
            title="Xem và truy vấn bảng ThongBao trong SQL Server"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQL Server (ThongBao)</span>
          </button>
        )}
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

      {/* Form: Gửi thông báo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Soạn thông báo gửi học viên
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Mẫu soạn nhanh:</span>
            <button
              type="button"
              onClick={() => handleTemplate('LichHoc')}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold hover:bg-blue-100 transition"
            >
              Lịch khai giảng
            </button>
            <button
              type="button"
              onClick={() => handleTemplate('HocPhi')}
              className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[11px] font-semibold hover:bg-amber-100 transition"
            >
              Nhắc học phí
            </button>
            <button
              type="button"
              onClick={() => handleTemplate('DiemSo')}
              className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-semibold hover:bg-purple-100 transition"
            >
              Kết quả học tập
            </button>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Kênh gửi tin
              </label>
              <select
                value={formData.KenhGui}
                onChange={e => setFormData({ ...formData, KenhGui: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Zalo">Zalo ZNS / Official Account (Khuyên dùng)</option>
                <option value="SMS">SMS Brandname KIENTRE</option>
                <option value="Email">Email thông báo chính thức</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Loại thông báo
              </label>
              <select
                value={formData.Loai}
                onChange={e => setFormData({ ...formData, Loai: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="LichHoc">Lịch học & Khai giảng</option>
                <option value="HocPhi">Nhắc nợ / Biên lai học phí</option>
                <option value="DiemSo">Bảng điểm & Kết quả</option>
                <option value="ChungChi">Chứng chỉ tốt nghiệp</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Người nhận
              </label>
              <select
                value={formData.NguoiNhan}
                onChange={e => setFormData({ ...formData, NguoiNhan: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {studentList.map((st, idx) => (
                  <option key={`${st.MaHV}-${idx}`} value={`${st.TenHV} (${st.MaHV})`}>
                    {st.TenHV} ({st.SoDienThoai})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Tiêu đề thông báo
            </label>
            <input
              type="text"
              value={formData.TieuDe}
              onChange={e => setFormData({ ...formData, TieuDe: e.target.value })}
              placeholder="Nhập tiêu đề tin nhắn..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nội dung thông điệp
            </label>
            <textarea
              rows={3}
              value={formData.NoiDung}
              onChange={e => setFormData({ ...formData, NoiDung: e.target.value })}
              placeholder="Nhập nội dung cần gửi đến học viên..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thông báo</span>
            </button>
          </div>
        </form>
      </div>

      {/* History table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Lịch sử gửi thông báo ({filtered.length})
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm thông báo..."
              className="w-full pl-9 pr-3 py-1 text-xs border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Mã TB</th>
                <th className="py-2.5 px-3">Người nhận</th>
                <th className="py-2.5 px-3">Kênh</th>
                <th className="py-2.5 px-3">Tiêu đề & Nội dung</th>
                <th className="py-2.5 px-3 font-mono">Thời gian gửi</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(tb => (
                <tr key={tb.MaThongBao} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{tb.MaThongBao}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{tb.NguoiNhan}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                      {tb.KenhGui}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-md">
                    <div className="font-bold text-slate-800">{tb.TieuDe}</div>
                    <div className="text-[11px] text-slate-500 truncate">{tb.NoiDung}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{tb.NgayGui}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                      Đã gửi thành công
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTargetNotif(tb)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Xóa thông báo này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetNotif && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa thông báo</h3>
            </div>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa vĩnh viễn thông báo{' '}
              <span className="font-semibold text-slate-900 font-mono">[{deleteTargetNotif.MaThongBao}]</span> gửi đến{' '}
              <span className="font-semibold text-slate-900">{deleteTargetNotif.NguoiNhan}</span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTargetNotif(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = deleteNotification(deleteTargetNotif.MaThongBao);
                  setNotification({ type: res.success ? 'success' : 'error', text: res.message });
                  setDeleteTargetNotif(null);
                }}
                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
              >
                Xóa thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {showSqlWorkbench && (
        <SqlServerWorkbenchModal
          initialTable="ThongBao"
          onClose={() => setShowSqlWorkbench(false)}
        />
      )}
    </div>
  );
};
