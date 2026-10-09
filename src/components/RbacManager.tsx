import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Building2,
  Sliders,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';

interface ModulePermission {
  id: string;
  category: 'A. Quản trị' | 'B. Kinh doanh' | 'C. Đào tạo' | 'D. Hệ thống';
  code: string;
  name: string;
  description: string;
  roles: {
    Admin: boolean;
    GiaoVu: boolean;
    KeToan: boolean;
    GiangVien: boolean;
  };
}

const DEFAULT_PERMISSIONS: ModulePermission[] = [
  // A. Quản trị
  {
    id: 'm1',
    category: 'A. Quản trị',
    code: '01. AUTH',
    name: 'Đăng nhập',
    description: 'Xác thực tài khoản nội bộ, quản lý phiên làm việc & đổi mật khẩu',
    roles: { Admin: true, GiaoVu: true, KeToan: true, GiangVien: true },
  },
  {
    id: 'm2',
    category: 'A. Quản trị',
    code: '02. RBAC',
    name: 'Phân quyền',
    description: 'Quản trị ma trận phân quyền vai trò (Role-Based Access Control) & giới hạn chi nhánh',
    roles: { Admin: true, GiaoVu: false, KeToan: false, GiangVien: false },
  },
  {
    id: 'm3',
    category: 'A. Quản trị',
    code: '03. STAFF',
    name: 'Quản lý nhân viên',
    description: 'Hồ sơ nhân sự, tài khoản hệ thống, chức vụ & phòng ban',
    roles: { Admin: true, GiaoVu: false, KeToan: false, GiangVien: false },
  },
  {
    id: 'm4',
    category: 'A. Quản trị',
    code: '04. BRANCH',
    name: 'Quản lý chi nhánh',
    description: 'Mạng lưới cơ sở đào tạo, phòng học, trang thiết bị & phân bổ nhân sự',
    roles: { Admin: true, GiaoVu: true, KeToan: true, GiangVien: false },
  },

  // B. Kinh doanh
  {
    id: 'm5',
    category: 'B. Kinh doanh',
    code: '05. CRM',
    name: 'Quản lý khách hàng tiềm năng',
    description: 'Phễu tư vấn CRM, tiếp nhận Lead, theo dõi chuyển đổi học viên',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },
  {
    id: 'm6',
    category: 'B. Kinh doanh',
    code: '06. COURSE',
    name: 'Quản lý khóa học',
    description: 'Danh mục chương trình đào tạo, đơn giá học phí, thời lượng & chuẩn đầu ra',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },
  {
    id: 'm7',
    category: 'B. Kinh doanh',
    code: '07. STUDENT',
    name: 'Quản lý học viên',
    description: 'Hồ sơ lý lịch học viên, CCCD, thông tin liên lạc, lịch sử đào tạo',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },
  {
    id: 'm8',
    category: 'B. Kinh doanh',
    code: '08. CLASS',
    name: 'Quản lý lớp học',
    description: 'Mở lớp, quy mô sĩ số, trạng thái chiêu sinh, giảng viên phụ trách',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: true },
  },
  {
    id: 'm9',
    category: 'B. Kinh doanh',
    code: '09. ENROLL',
    name: 'Ghi danh',
    description: 'Phiếu ghi danh chính thức, giữ chỗ, kiểm tra ràng buộc sĩ số & khóa học',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },
  {
    id: 'm10',
    category: 'B. Kinh doanh',
    code: '10. CONTRACT',
    name: 'Hợp đồng đào tạo',
    description: 'Hợp đồng cam kết chuẩn đầu ra, điều khoản nghĩa vụ đào tạo & mẫu in pháp lý',
    roles: { Admin: true, GiaoVu: true, KeToan: true, GiangVien: false },
  },
  {
    id: 'm11',
    category: 'B. Kinh doanh',
    code: '11. PAYMENT',
    name: 'Thanh toán',
    description: 'Hóa đơn học phí, tạo VietQR tự động, thanh toán tiền mặt/chuyển khoản',
    roles: { Admin: true, GiaoVu: false, KeToan: true, GiangVien: false },
  },
  {
    id: 'm12',
    category: 'B. Kinh doanh',
    code: '12. DEBT',
    name: 'Công nợ',
    description: 'Theo dõi học viên còn nợ học phí, tuổi nợ quá hạn, nhắc nợ Zalo & cam kết trả nợ',
    roles: { Admin: true, GiaoVu: false, KeToan: true, GiangVien: false },
  },
  {
    id: 'm13',
    category: 'B. Kinh doanh',
    code: '13. CASHFLOW',
    name: 'Thu – chi',
    description: 'Phiếu thu, phiếu chi, quản lý dòng tiền mặt & tài khoản ngân hàng cơ sở',
    roles: { Admin: true, GiaoVu: false, KeToan: true, GiangVien: false },
  },

  // C. Đào tạo
  {
    id: 'm14',
    category: 'C. Đào tạo',
    code: '14. TEST',
    name: 'Thi đầu vào',
    description: 'Đánh giá năng lực 4 kỹ năng đầu vào, phân hạng trình độ & đề xuất khóa học',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: true },
  },
  {
    id: 'm15',
    category: 'C. Đào tạo',
    code: '15. SCHEDULE',
    name: 'Lịch học',
    description: 'Thời khóa biểu theo tuần, phân phòng học, ca học & giảng viên đứng lớp',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: true },
  },
  {
    id: 'm16',
    category: 'C. Đào tạo',
    code: '16. ATTEND',
    name: 'Điểm danh',
    description: 'Ghi nhận chuyên cần từng buổi học, có phép/không phép, cảnh báo vắng',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: true },
  },
  {
    id: 'm17',
    category: 'C. Đào tạo',
    code: '17. GRADE',
    name: 'Quản lý điểm',
    description: 'Nhập điểm chuyên cần (10%), giữa kỳ (30%), cuối kỳ (60%), tính điểm tổng kết & xếp loại',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: true },
  },
  {
    id: 'm18',
    category: 'C. Đào tạo',
    code: '18. CERT',
    name: 'Chứng chỉ',
    description: 'Cấp chứng chỉ hoàn thành khóa học, tra cứu số hiệu văn bằng & in phôi chứng chỉ',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: true },
  },
  {
    id: 'm19',
    category: 'C. Đào tạo',
    code: '19. DEFER',
    name: 'Bảo lưu',
    description: 'Tiếp nhận đơn bảo lưu kết quả và học phí, kiểm soát thời hạn bảo lưu',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },
  {
    id: 'm20',
    category: 'C. Đào tạo',
    code: '20. TRANSFER',
    name: 'Chuyển lớp',
    description: 'Đơn chuyển lớp, điều chỉnh sĩ số, quyết toán chênh lệch học phí',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },

  // D. Hệ thống
  {
    id: 'm21',
    category: 'D. Hệ thống',
    code: '21. NOTIF',
    name: 'Thông báo',
    description: 'Gửi tin nhắn Zalo ZNS, SMS Brandname, Email nhắc lịch học & học phí',
    roles: { Admin: true, GiaoVu: true, KeToan: false, GiangVien: false },
  },
  {
    id: 'm22',
    category: 'D. Hệ thống',
    code: '22. DASH',
    name: 'Dashboard',
    description: 'Tổng quan chỉ số KPI, doanh thu, sĩ số, hiệu suất hoạt động toàn diện',
    roles: { Admin: true, GiaoVu: true, KeToan: true, GiangVien: true },
  },
  {
    id: 'm23',
    category: 'D. Hệ thống',
    code: '23. REPORT',
    name: 'Báo cáo – thống kê',
    description: 'Phân tích tài chính, tuyển sinh, công nợ, hiệu suất giảng dạy & xuất file',
    roles: { Admin: true, GiaoVu: false, KeToan: true, GiangVien: false },
  },
];

export const RbacManager: React.FC = () => {
  const { staffList, currentUser, switchRoleForDemo } = useApp();
  const [permissions, setPermissions] = useState<ModulePermission[]>(DEFAULT_PERMISSIONS);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const togglePermission = (moduleId: string, role: UserRole) => {
    if (currentUser?.VaiTro !== 'Admin') {
      alert('Chỉ tài khoản Quản trị viên (Admin) mới có quyền sửa đổi ma trận phân quyền!');
      return;
    }
    setPermissions(prev =>
      prev.map(p => {
        if (p.id === moduleId) {
          return {
            ...p,
            roles: {
              ...p.roles,
              [role]: !p.roles[role],
            },
          };
        }
        return p;
      })
    );
  };

  const handleSavePolicy = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const categories: Array<'A. Quản trị' | 'B. Kinh doanh' | 'C. Đào tạo' | 'D. Hệ thống'> = [
    'A. Quản trị',
    'B. Kinh doanh',
    'C. Đào tạo',
    'D. Hệ thống',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <span>Phân quyền người dùng (RBAC Matrix)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị quyền truy cập theo vai trò trên 23 phân hệ nghiệp vụ đào tạo & kinh doanh
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Đã cập nhật chính sách RBAC
            </span>
          )}
          <button
            onClick={handleSavePolicy}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            Lưu thay đổi chính sách
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            role: 'Admin' as UserRole,
            title: 'Quản trị viên (Admin)',
            desc: 'Toàn quyền cấu hình hệ thống, nhân sự, chi nhánh & báo cáo tài chính',
            color: 'border-purple-200 bg-purple-50/50 text-purple-900',
            badgeBg: 'bg-purple-100 text-purple-800',
            userCount: staffList.filter(s => s.VaiTro === 'Admin').length,
          },
          {
            role: 'GiaoVu' as UserRole,
            title: 'Giáo vụ (Academic Staff)',
            desc: 'Quản lý khóa học, lớp học, học viên, ghi danh, thời khóa biểu, điểm danh & cấp bằng',
            color: 'border-blue-200 bg-blue-50/50 text-blue-900',
            badgeBg: 'bg-blue-100 text-blue-800',
            userCount: staffList.filter(s => s.VaiTro === 'GiaoVu').length,
          },
          {
            role: 'KeToan' as UserRole,
            title: 'Kế toán (Accountant)',
            desc: 'Quản lý thu học phí, sổ quỹ thu-chi, công nợ, hợp đồng đào tạo & báo cáo tài chính',
            color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
            badgeBg: 'bg-emerald-100 text-emerald-800',
            userCount: staffList.filter(s => s.VaiTro === 'KeToan').length,
          },
          {
            role: 'GiangVien' as UserRole,
            title: 'Giảng viên (Instructor)',
            desc: 'Theo dõi lịch dạy, điểm danh lớp học, đánh giá bài thi đầu vào & nhập điểm học viên',
            color: 'border-amber-200 bg-amber-50/50 text-amber-900',
            badgeBg: 'bg-amber-100 text-amber-800',
            userCount: staffList.filter(s => s.VaiTro === 'GiangVien').length,
          },
        ].map(r => (
          <div
            key={r.role}
            className={`p-4 rounded-xl border ${r.color} shadow-xs flex flex-col justify-between transition-all`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.badgeBg}`}>
                  {r.role}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {r.userCount} tài khoản
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{r.title}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{r.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Mô phỏng trải nghiệm:</span>
              <button
                onClick={() => switchRoleForDemo(r.role)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition ${
                  currentUser?.VaiTro === r.role
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {currentUser?.VaiTro === r.role ? 'Đang kích hoạt' : 'Chuyển vai trò'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Filter & Notice */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Lọc theo vai trò:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['ALL', 'Admin', 'GiaoVu', 'KeToan', 'GiangVien'] as const).map(role => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  selectedRoleFilter === role
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role === 'ALL' ? 'Tất cả 4 vai trò' : role}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Click vào các ô trạng thái để bật / tắt quyền hạn cho từng vai trò trên từng phân hệ.</span>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Ma trận phân quyền chi tiết (23 Phân hệ chuẩn)
          </div>
          <div className="text-[11px] text-slate-500">
            Tổng cộng: 23 phân hệ chuẩn hóa A. Quản trị, B. Kinh doanh, C. Đào tạo, D. Hệ thống
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 w-16 text-center">Mã</th>
                <th className="px-4 py-3">Phân hệ nghiệp vụ & Mô tả</th>
                <th className="px-4 py-3 w-28 text-center text-purple-700">
                  Quản trị viên<br /><span className="text-[9px] font-normal">(Admin)</span>
                </th>
                <th className="px-4 py-3 w-28 text-center text-blue-700">
                  Giáo vụ<br /><span className="text-[9px] font-normal">(Academic)</span>
                </th>
                <th className="px-4 py-3 w-28 text-center text-emerald-700">
                  Kế toán<br /><span className="text-[9px] font-normal">(Accountant)</span>
                </th>
                <th className="px-4 py-3 w-28 text-center text-amber-700">
                  Giảng viên<br /><span className="text-[9px] font-normal">(Instructor)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => {
                const itemsInCat = permissions.filter(p => p.category === cat);
                return (
                  <React.Fragment key={cat}>
                    <tr className="bg-slate-50/80 font-bold text-slate-800 text-[11px]">
                      <td colSpan={6} className="px-4 py-2 bg-slate-100 text-slate-900 border-y border-slate-200">
                        {cat} ({itemsInCat.length} chức năng)
                      </td>
                    </tr>
                    {itemsInCat.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                          {item.code.split('.')[0]}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                        </td>

                        {/* Admin */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePermission(item.id, 'Admin')}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                              item.roles.Admin
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Admin: ${item.roles.Admin ? 'Được phép' : 'Bị chặn'}`}
                          >
                            {item.roles.Admin ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-700" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* GiaoVu */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePermission(item.id, 'GiaoVu')}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                              item.roles.GiaoVu
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Giáo vụ: ${item.roles.GiaoVu ? 'Được phép' : 'Bị chặn'}`}
                          >
                            {item.roles.GiaoVu ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-700" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* KeToan */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePermission(item.id, 'KeToan')}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                              item.roles.KeToan
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Kế toán: ${item.roles.KeToan ? 'Được phép' : 'Bị chặn'}`}
                          >
                            {item.roles.KeToan ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* GiangVien */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePermission(item.id, 'GiangVien')}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                              item.roles.GiangVien
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Giảng viên: ${item.roles.GiangVien ? 'Được phép' : 'Bị chặn'}`}
                          >
                            {item.roles.GiangVien ? (
                              <CheckCircle2 className="w-4 h-4 text-amber-700" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
