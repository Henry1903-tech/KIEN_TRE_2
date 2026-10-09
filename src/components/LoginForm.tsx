import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KienTreLogo } from './KienTreLogo';
import { Eye, EyeOff, Lock, User, ShieldCheck, CheckCircle2, AlertCircle, Database } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('tuanta');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu!');
      return;
    }

    const res = login(username, password);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword('123456');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        {/* Left Form: 7 cols */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="mb-6">
              <KienTreLogo variant="horizontal" size="lg" theme="dark" />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Hệ Thống Quản Trị Đào Tạo & Kinh Doanh
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Công ty Cổ phần Đầu tư Giáo dục KIẾN TRẺ · Cổng thông tin nội bộ
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập hoặc email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập (ví dụ: tuanta, kimanh)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (mặc định: 123456)"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span>Ghi nhớ tài khoản</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">SQL Server Auth</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs tracking-wide shadow-sm transition-colors cursor-pointer"
              >
                Đăng nhập hệ thống
              </button>
            </form>
          </div>

          {/* Quick Account Switcher for Assessment & Demonstration */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tài khoản kiểm thử nhanh (Mật khẩu: 123456):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('tuanta')}
                className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 font-medium text-left truncate cursor-pointer"
                title="Admin: tuanta"
              >
                <div className="font-bold">tuanta</div>
                <div className="text-[10px] text-emerald-600">Admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hung.dang')}
                className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 font-medium text-left truncate cursor-pointer"
                title="Giáo vụ: hung.dang"
              >
                <div className="font-bold">hung.dang</div>
                <div className="text-[10px] text-blue-600">Giáo vụ</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('minh.ly')}
                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 font-medium text-left truncate cursor-pointer"
                title="Kế toán: minh.ly"
              >
                <div className="font-bold">minh.ly</div>
                <div className="text-[10px] text-amber-600">Kế toán</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('quan.tran')}
                className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded border border-purple-200 font-medium text-left truncate cursor-pointer"
                title="Giảng viên: quan.tran"
              >
                <div className="font-bold">quan.tran</div>
                <div className="text-[10px] text-purple-600">Giảng viên</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Illustration Panel: 5 cols */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <h3 className="text-base font-extrabold tracking-wider uppercase text-emerald-300">
              KIẾN TẠO TRI THỨC · VỮNG BƯỚC TƯƠNG LAI
            </h3>
            <p className="text-xs text-emerald-100/80 mt-1">
              Công ty Cổ phần Đầu tư Giáo dục KIẾN TRẺ
            </p>
          </div>

          {/* Stylized KIẾN TRẺ Scholar Ant Vector Mascot */}
          <div className="relative z-10 my-4 flex flex-col items-center justify-center">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                {/* Aura rings */}
                <circle cx="100" cy="100" r="85" fill="#065f46" opacity="0.35" />
                <circle cx="100" cy="100" r="70" fill="#047857" opacity="0.25" />

                {/* Hexagon knowledge foundation */}
                <polygon
                  points="100,20 160,55 160,125 100,160 40,125 40,55"
                  stroke="#34d399"
                  strokeWidth="3"
                  fill="rgba(6, 78, 59, 0.4)"
                  strokeLinejoin="round"
                />

                {/* Ant Body - Thorax and Abdomen */}
                <ellipse cx="100" cy="120" rx="38" ry="42" fill="#059669" />
                <ellipse cx="100" cy="126" rx="26" ry="28" fill="#10b981" />

                {/* Ant legs (Architectural branches) */}
                <path d="M 64,115 Q 40,110 32,130" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 136,115 Q 160,110 168,130" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 68,135 Q 45,145 36,160" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 132,135 Q 155,145 164,160" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Ant Antennae (Râu tri thức vàng sáng) */}
                <path d="M 88,58 Q 70,30 55,34" stroke="#fde047" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="55" cy="34" r="5" fill="#fde047" />
                <path d="M 112,58 Q 130,30 145,34" stroke="#fde047" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="145" cy="34" r="5" fill="#fde047" />

                {/* Ant Head */}
                <circle cx="100" cy="80" r="26" fill="#ffffff" />
                {/* Eyes large intellectual glasses */}
                <circle cx="88" cy="80" r="11" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="112" cy="80" r="11" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M 98,80 L 102,80" stroke="#f59e0b" strokeWidth="3" />
                <circle cx="90" cy="80" r="5" fill="#0f172a" />
                <circle cx="92" cy="78" r="1.5" fill="#ffffff" />
                <circle cx="110" cy="80" r="5" fill="#0f172a" />
                <circle cx="112" cy="78" r="1.5" fill="#ffffff" />

                {/* Graduation Mortarboard Cap */}
                <polygon points="100,38 148,50 100,62 52,50" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                <polygon points="76,57 124,57 120,68 80,68" fill="#0f172a" />
                {/* Tassel */}
                <path d="M 100,50 Q 135,55 138,72" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
                <circle cx="138" cy="73" r="3" fill="#f59e0b" />

                {/* Open Book of Knowledge held by Ant */}
                <path d="M 70,140 Q 100,132 100,146 Q 100,132 130,140 L 130,122 Q 100,114 100,128 Q 100,114 70,122 Z" fill="#ffffff" />
                <path d="M 100,128 L 100,146" stroke="#059669" strokeWidth="2" />
              </svg>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-200 tracking-wide text-center">
              KIẾN TRẺ EDUCATION MASCOT
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-emerald-800/60 text-center space-y-1">
            <div className="text-[11px] font-bold text-emerald-300">
              ĐỀ TÀI NGHIÊN CỨU & XÂY DỰNG HỆ THỐNG:
            </div>
            <div className="text-[10px] text-emerald-100/90 leading-tight">
              Phân tích, thiết kế và xây dựng hệ thống quản trị đào tạo và kinh doanh dịch vụ giáo dục tại Công ty Cổ phần Đầu tư Giáo dục KIẾN TRẺ
            </div>
            <div className="text-[9.5px] text-emerald-400/80 font-mono mt-1">
              MS SQL SERVER (BCNF) · REACT VITE · EXPRESS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
