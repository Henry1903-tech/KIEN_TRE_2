import React, { useState, useMemo } from 'react';
import { formatVND } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Layers,
  Sparkles,
  Info,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export type ChartType = 'combo' | 'bar' | 'line' | 'area' | 'grouped' | 'donut';

export interface MonthlyChartDataPoint {
  thang: string;
  doanhThu: number;
  hocVien?: number;
  congNo?: number;
}

export interface BranchShareDataPoint {
  maChiNhanh: string;
  tenChiNhanh: string;
  doanhThu: number;
  hocVien: number;
  color: string;
}

interface FinancialChartProps {
  data: MonthlyChartDataPoint[];
  branchData?: BranchShareDataPoint[];
  title?: string;
  subtitle?: string;
  defaultType?: ChartType;
  accentColor?: 'emerald' | 'blue' | 'indigo';
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  data,
  branchData,
  title = 'Phân tích Doanh thu & Tăng trưởng Kinh doanh',
  subtitle = 'Dữ liệu tài chính chuỗi thời gian 34 tháng liên tục (2024 - 2026)',
  defaultType = 'combo',
  accentColor = 'emerald',
}) => {
  // State for chart type
  const [chartType, setChartType] = useState<ChartType>(defaultType);
  const [selectedYear, setSelectedYear] = useState<'ALL' | '2026' | '2025' | '2024'>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyChartDataPoint | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<BranchShareDataPoint | null>(null);
  const [showRecommendedNotice, setShowRecommendedNotice] = useState<boolean>(true);

  // Filter data according to year
  const filteredData = useMemo(() => {
    if (selectedYear === '2026') return data.filter(d => d.thang.endsWith('/26'));
    if (selectedYear === '2025') return data.filter(d => d.thang.endsWith('/25'));
    if (selectedYear === '2024') return data.filter(d => d.thang.endsWith('/24'));
    return data;
  }, [data, selectedYear]);

  // Compute calculated metrics for enriched chart presentation
  const enrichedData = useMemo(() => {
    return filteredData.map((curr, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1] : null;
      const momGrowth = prev && prev.doanhThu > 0
        ? ((curr.doanhThu - prev.doanhThu) / prev.doanhThu) * 100
        : 0;

      // Realistic debt estimation (~10% - 15% unpaid during that period)
      const estimatedDebt = curr.congNo !== undefined
        ? curr.congNo
        : Math.round(curr.doanhThu * (curr.thang === '10/26' ? 0.22 : 0.08));

      return {
        ...curr,
        momGrowth: Math.round(momGrowth * 10) / 10,
        congNo: estimatedDebt,
        tongPhatSinh: curr.doanhThu + estimatedDebt,
      };
    });
  }, [filteredData]);

  // Max revenue for scaling
  const maxRevenue = useMemo(() => {
    if (enrichedData.length === 0) return 1;
    return Math.max(...enrichedData.map(d => Math.max(d.doanhThu, d.tongPhatSinh)), 1);
  }, [enrichedData]);

  // Financial summary statistics
  const summary = useMemo(() => {
    const totalRev = enrichedData.reduce((s, d) => s + d.doanhThu, 0);
    const totalStudents = enrichedData.reduce((s, d) => s + (d.hocVien || 0), 0);
    const avgMonthlyRev = enrichedData.length > 0 ? totalRev / enrichedData.length : 0;
    const peak = enrichedData.reduce(
      (max, d) => (d.doanhThu > (max?.doanhThu || 0) ? d : max),
      enrichedData[0] || null
    );

    const latest = enrichedData[enrichedData.length - 1];
    const prev = enrichedData.length > 1 ? enrichedData[enrichedData.length - 2] : null;
    const latestGrowth = prev && prev.doanhThu > 0
      ? Math.round(((latest.doanhThu - prev.doanhThu) / prev.doanhThu) * 100)
      : 0;

    return {
      totalRev,
      totalStudents,
      avgMonthlyRev,
      peak,
      latestGrowth,
    };
  }, [enrichedData]);

  // SVG Chart Dimensions
  const svgWidth = 860;
  const svgHeight = 240;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  // Compute coordinates for SVG Line and Area
  const points = useMemo(() => {
    const count = enrichedData.length;
    if (count <= 1) return [];

    return enrichedData.map((item, index) => {
      const x = paddingLeft + (index / (count - 1)) * chartInnerWidth;
      const normalizedY = 1 - (item.doanhThu / (maxRevenue * 1.1));
      const y = paddingTop + normalizedY * chartInnerHeight;
      return { x, y, item, index };
    });
  }, [enrichedData, maxRevenue, chartInnerWidth, chartInnerHeight]);

  // Create smooth SVG cubic bezier path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [points]);

  // Area closed path
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = svgHeight - paddingBottom;
    return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }, [linePath, points, svgHeight, paddingBottom]);

  // Default fallback branch data if not passed
  const branchesList = useMemo(() => {
    if (branchData && branchData.length > 0) return branchData;
    return [
      { maChiNhanh: 'CN01', tenChiNhanh: 'Quận 1 - Nguyễn Thị Minh Khai', doanhThu: 1320000000, hocVien: 840, color: '#3b82f6' },
      { maChiNhanh: 'CN02', tenChiNhanh: 'Quận 10 - Ba Tháng Hai', doanhThu: 1180000000, hocVien: 720, color: '#10b981' },
      { maChiNhanh: 'CN03', tenChiNhanh: 'Bình Thạnh - Điện Biên Phủ', doanhThu: 940000000, hocVien: 610, color: '#6366f1' },
      { maChiNhanh: 'CN04', tenChiNhanh: 'Thủ Đức - Võ Văn Ngân', doanhThu: 820000000, hocVien: 530, color: '#f59e0b' },
      { maChiNhanh: 'CN05', tenChiNhanh: 'Hà Nội - Cầu Giấy (Xuân Thủy)', doanhThu: 750000000, hocVien: 480, color: '#ec4899' },
      { maChiNhanh: 'CN06', tenChiNhanh: 'Hà Nội - Đống Đa (Chùa Bộc)', doanhThu: 680000000, hocVien: 420, color: '#8b5cf6' },
      { maChiNhanh: 'CN07', tenChiNhanh: 'Đà Nẵng - Hải Châu (Nguyễn Văn Linh)', doanhThu: 510000000, hocVien: 340, color: '#06b6d4' },
      { maChiNhanh: 'CN08', tenChiNhanh: 'Tân Bình - Cộng Hòa (Edu Hub)', doanhThu: 430000000, hocVien: 290, color: '#14b8a6' },
    ];
  }, [branchData]);

  const totalBranchRevenue = useMemo(() => {
    return branchesList.reduce((s, b) => s + b.doanhThu, 0);
  }, [branchesList]);

  // Chart Type Definitions with Explanations
  const chartTypesList: { id: ChartType; label: string; icon: React.FC<{ className?: string }>; desc: string; isRecommended?: boolean }[] = [
    {
      id: 'combo',
      label: 'Khuyên dùng Tài chính (Combo Cột + Xu hướng)',
      icon: Sparkles,
      desc: 'Chuẩn CFO: Cột doanh thu tuyệt đối kết hợp đường xu hướng tăng trưởng MoM %',
      isRecommended: true,
    },
    {
      id: 'bar',
      label: 'Cột (Bar Chart)',
      icon: BarChart3,
      desc: 'So sánh mức doanh thu tuyệt đối qua từng tháng theo niên độ',
    },
    {
      id: 'line',
      label: 'Đường Xu hướng (Line)',
      icon: TrendingUp,
      desc: 'Phân tích đà tăng trưởng, điểm uốn và chu kỳ bán hàng theo thời gian',
    },
    {
      id: 'area',
      label: 'Vùng tích lũy (Area)',
      icon: Layers,
      desc: 'Trực quan hóa khối lượng dòng tiền dồn tích và quy mô tài chính',
    },
    {
      id: 'grouped',
      label: 'Thực thu vs Công nợ (Grouped)',
      icon: SlidersHorizontal,
      desc: 'Đối chiếu song song Doanh thu thực nhận và Công nợ phải thu từng kỳ',
    },
    {
      id: 'donut',
      label: 'Cơ cấu Doanh thu (Donut %)',
      icon: PieChart,
      desc: 'Tỷ trọng % đóng góp của 8 chi nhánh trong tổng doanh thu toàn hệ thống',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header with Title and Financial Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>{title}</span>
            </h2>
            {chartType === 'combo' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Chuẩn Tài chính</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Year Filter Tab Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {[
              { id: 'ALL' as const, label: '3 năm (34T)' },
              { id: '2026' as const, label: 'Năm 2026' },
              { id: '2025' as const, label: 'Năm 2025' },
              { id: '2024' as const, label: 'Năm 2024' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedYear(tab.id)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer text-xs ${
                  selectedYear === tab.id
                    ? 'bg-blue-700 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHART TYPE SELECTOR - Nơi người dùng tự do chọn các dạng biểu đồ hoặc chọn mẫu chuẩn */}
      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Chọn dạng biểu đồ phân tích:</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Đang hiển thị:{' '}
            <b className="text-slate-900">
              {chartTypesList.find(c => c.id === chartType)?.label}
            </b>
          </div>
        </div>

        {/* Buttons List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {chartTypesList.map(type => {
            const Icon = type.icon;
            const isActive = chartType === type.id;
            const isRec = type.isRecommended;

            return (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                title={type.desc}
                className={`flex flex-col items-start p-2 rounded-lg border text-left transition cursor-pointer relative ${
                  isActive
                    ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                {isRec && (
                  <span className="absolute top-1 right-1 text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Khuyên dùng
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? (isRec ? 'text-amber-600' : 'text-blue-700') : 'text-slate-500'
                    }`}
                  />
                  <span className={`text-xs font-bold ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                    {type.id === 'combo' ? 'Combo CFO' : type.id === 'bar' ? 'Cột' : type.id === 'line' ? 'Xu hướng' : type.id === 'area' ? 'Vùng' : type.id === 'grouped' ? 'Thu vs Nợ' : 'Tròn %'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                  {type.id === 'combo' ? 'Cột + Đường tăng trưởng' : type.id === 'grouped' ? 'Đối chiếu 2 chỉ số' : type.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Financial Chart Advice Notice */}
      {showRecommendedNotice && chartType === 'combo' && (
        <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <b>Tại sao nên chọn Combo cho Báo cáo Tài chính?</b> Dạng biểu đồ này vừa theo dõi giá trị tuyệt đối doanh thu từng tháng (Cột xanh), vừa thể hiện tốc độ tăng trưởng liên tục (Đường nối và % MoM), giúp đánh giá chính xác hiệu quả tuyển sinh và dòng tiền.
            </span>
          </div>
          <button
            onClick={() => setShowRecommendedNotice(false)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer ml-2"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 4 Financial Highlight Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">Tổng thực thu trong kỳ</div>
          <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
            {formatVND(summary.totalRev)}
          </div>
          <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{enrichedData.length} tháng ghi nhận doanh thu</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">Doanh thu trung bình / tháng</div>
          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
            {formatVND(Math.round(summary.avgMonthlyRev))}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Độ ổn định tài chính cao</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">Tháng đạt đỉnh doanh thu</div>
          <div className="text-base font-bold text-amber-700 font-mono mt-0.5">
            {summary.peak ? `${summary.peak.thang} (${formatVND(summary.peak.doanhThu)})` : 'N/A'}
          </div>
          <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Giai đoạn cao điểm tuyển sinh</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">Tăng trưởng kỳ gần nhất (MoM)</div>
          <div className="text-base font-bold text-indigo-700 font-mono mt-0.5 flex items-center gap-1">
            {summary.latestGrowth >= 0 ? `+${summary.latestGrowth}%` : `${summary.latestGrowth}%`}
          </div>
          <div className="text-[10px] text-indigo-600 mt-1 flex items-center gap-1">
            <Percent className="w-3 h-3" />
            <span>So với tháng liền kề trước đó</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RENDER KHU VỰC BIỂU ĐỒ THEO DẠNG ĐƯỢC CHỌN (CHART VIEW AREA) */}
      {/* ========================================================================= */}

      {/* DẠNG 1: COMBO (CỘT + ĐƯỜNG XU HƯỚNG TĂNG TRƯỞNG) - CHUẨN TÀI CHÍNH */}
      {chartType === 'combo' && (
        <div className="space-y-3 pt-2">
          <div className="overflow-x-auto pb-2">
            <div
              className="relative h-60 border-b border-slate-200 px-4 flex items-end"
              style={{ minWidth: enrichedData.length > 12 ? `${enrichedData.length * 44}px` : '100%' }}
            >
              {/* Background Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-4 opacity-30">
                <div className="border-b border-dashed border-slate-300 w-full" />
                <div className="border-b border-dashed border-slate-300 w-full" />
                <div className="border-b border-dashed border-slate-300 w-full" />
              </div>

              {/* Bars + Overlay Trend Dots */}
              <div className="w-full h-full flex items-end justify-between gap-1.5 relative z-10">
                {enrichedData.map(item => {
                  const heightPercent = Math.round((item.doanhThu / maxRevenue) * 85);
                  const isHighlight = item.thang === '10/26';
                  const is2026 = item.thang.endsWith('/26');
                  const is2025 = item.thang.endsWith('/25');
                  const isHovered = hoveredPoint?.thang === item.thang;

                  return (
                    <div
                      key={item.thang}
                      onMouseEnter={() => setHoveredPoint(item)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group min-w-[32px] cursor-pointer"
                    >
                      {/* Tooltip Hover Value */}
                      <div
                        className={`text-[9px] font-mono mb-1 transition-all px-1 py-0.5 rounded shadow-2xs ${
                          isHovered
                            ? 'opacity-100 bg-slate-900 text-white font-bold scale-110'
                            : 'opacity-0 group-hover:opacity-100 bg-slate-100 text-slate-700'
                        }`}
                      >
                        {(item.doanhThu / 1000000).toFixed(0)}Tr
                      </div>

                      {/* Bar Column */}
                      <div className="w-full relative flex items-end justify-center">
                        <div
                          style={{ height: `${Math.max(8, heightPercent)}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 relative ${
                            isHighlight
                              ? 'bg-amber-500 ring-2 ring-amber-300'
                              : is2026
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : is2025
                              ? 'bg-indigo-500 hover:bg-indigo-600'
                              : 'bg-emerald-500 hover:bg-emerald-600'
                          } ${isHovered ? 'brightness-110 shadow-md' : ''}`}
                        >
                          {/* Trend point at the top of the bar */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-xs" />
                        </div>
                      </div>

                      {/* X-axis label */}
                      <span
                        className={`text-[9px] mt-2 font-mono whitespace-nowrap ${
                          isHighlight
                            ? 'font-bold text-amber-700'
                            : isHovered
                            ? 'font-bold text-blue-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.thang}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend and MoM indicator */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-2 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block" /> Năm 2024 (Lục)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-500 rounded-xs inline-block" /> Năm 2025 (Chàm)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-600 rounded-xs inline-block" /> Năm 2026 (Lam)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block" /> Hiện tại (10/26)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-emerald-600 inline-block" /> Điểm xu thế
              </span>
            </div>
            <span className="font-medium text-slate-600">Đơn vị: VNĐ · Trục tung tự động scale</span>
          </div>
        </div>
      )}

      {/* DẠNG 2: BIỂU ĐỒ CỘT THUẦN TÚY (BAR / COLUMN) */}
      {chartType === 'bar' && (
        <div className="space-y-3 pt-2">
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-end h-56 border-b border-slate-200 px-4 gap-1.5 sm:gap-2"
              style={{ minWidth: enrichedData.length > 12 ? `${enrichedData.length * 40}px` : '100%' }}
            >
              {enrichedData.map(item => {
                const heightPercent = Math.round((item.doanhThu / maxRevenue) * 92);
                const isHighlight = item.thang === '10/26';
                const is2026 = item.thang.endsWith('/26');
                const is2025 = item.thang.endsWith('/25');

                return (
                  <div
                    key={item.thang}
                    onMouseEnter={() => setHoveredPoint(item)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group min-w-[28px] cursor-pointer"
                  >
                    <div className="text-[9px] text-slate-500 font-mono mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.doanhThu / 1000000).toFixed(0)}Tr
                    </div>
                    <div
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isHighlight
                          ? 'bg-amber-500 ring-2 ring-amber-300'
                          : is2026
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : is2025
                          ? 'bg-indigo-500 hover:bg-indigo-600'
                          : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    />
                    <span
                      className={`text-[9px] mt-2 font-mono whitespace-nowrap ${
                        isHighlight ? 'font-bold text-amber-700' : 'text-slate-600'
                      }`}
                    >
                      {item.thang}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>Cột dọc thể hiện doanh thu từng tháng</span>
            <span>Đơn vị: VNĐ</span>
          </div>
        </div>
      )}

      {/* DẠNG 3: BIỂU ĐỒ ĐƯỜNG XU HƯỚNG (LINE TREND) */}
      {chartType === 'line' && (
        <div className="space-y-3 pt-2">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] w-full">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                {/* Horizontal Guide lines */}
                {[0.25, 0.5, 0.75, 1].map(ratio => {
                  const y = paddingTop + (1 - ratio) * chartInnerHeight;
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        fontSize="9"
                        fill="#94a3b8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {((maxRevenue * ratio) / 1000000).toFixed(0)}M
                      </text>
                    </g>
                  );
                })}

                {/* The Smooth Trend Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dots and Labels */}
                {points.map(({ x, y, item }) => {
                  const isHovered = hoveredPoint?.thang === item.thang;
                  const isPeak = summary.peak?.thang === item.thang;

                  return (
                    <g
                      key={item.thang}
                      onMouseEnter={() => setHoveredPoint(item)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isPeak ? 5.5 : isHovered ? 6 : 3.5}
                        fill={isPeak ? '#f59e0b' : isHovered ? '#1d4ed8' : '#ffffff'}
                        stroke={isPeak ? '#d97706' : '#2563eb'}
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={svgHeight - 12}
                        fontSize="9"
                        fill={isHovered ? '#1d4ed8' : '#64748b'}
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {item.thang}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Đường nối xu hướng tăng trưởng
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block ml-2" /> Điểm cực đại
            </span>
            <span>Trực quan chu kỳ kinh doanh</span>
          </div>
        </div>
      )}

      {/* DẠNG 4: BIỂU ĐỒ VÙNG TÍCH LŨY (AREA CHART) */}
      {chartType === 'area' && (
        <div className="space-y-3 pt-2">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] w-full">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                {[0.25, 0.5, 0.75, 1].map(ratio => {
                  const y = paddingTop + (1 - ratio) * chartInnerHeight;
                  return (
                    <line
                      key={ratio}
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Filled Area */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Top Border Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Dots */}
                {points.map(({ x, y, item }) => (
                  <g
                    key={item.thang}
                    onMouseEnter={() => setHoveredPoint(item)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={hoveredPoint?.thang === item.thang ? 5.5 : 3}
                      fill="#ffffff"
                      stroke="#059669"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={svgHeight - 12}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {item.thang}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>Vùng diện tích biểu thị quy mô dồn tích của dòng tiền</span>
            <span>Đơn vị: VNĐ</span>
          </div>
        </div>
      )}

      {/* DẠNG 5: BIỂU ĐỒ CỘT KÉP (REVENUE VS DEBT GROUPED) */}
      {chartType === 'grouped' && (
        <div className="space-y-3 pt-2">
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-end h-56 border-b border-slate-200 px-4 gap-2"
              style={{ minWidth: enrichedData.length > 12 ? `${enrichedData.length * 48}px` : '100%' }}
            >
              {enrichedData.map(item => {
                const revHeight = Math.round((item.doanhThu / maxRevenue) * 90);
                const debtHeight = Math.round(((item.congNo || 0) / maxRevenue) * 90);

                return (
                  <div
                    key={item.thang}
                    onMouseEnter={() => setHoveredPoint(item)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group min-w-[36px] cursor-pointer"
                  >
                    <div className="text-[9px] text-slate-500 font-mono mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.doanhThu / 1000000).toFixed(0)}Tr
                    </div>

                    {/* Dual Columns Container */}
                    <div className="w-full flex items-end justify-center gap-1">
                      {/* Column 1: Thực thu */}
                      <div
                        style={{ height: `${Math.max(4, revHeight)}%` }}
                        className="w-1/2 bg-emerald-600 hover:bg-emerald-700 rounded-t-xs transition-all"
                        title={`Thực thu: ${formatVND(item.doanhThu)}`}
                      />
                      {/* Column 2: Công nợ */}
                      <div
                        style={{ height: `${Math.max(3, debtHeight)}%` }}
                        className="w-1/2 bg-rose-500 hover:bg-rose-600 rounded-t-xs transition-all"
                        title={`Công nợ: ${formatVND(item.congNo || 0)}`}
                      />
                    </div>

                    <span className="text-[9px] mt-2 font-mono whitespace-nowrap text-slate-600">
                      {item.thang}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-600 rounded-xs inline-block" /> Thực thu học phí
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-500 rounded-xs inline-block" /> Công nợ còn lại
              </span>
            </div>
            <span>Giúp bộ phận kế toán đối chiếu thu hồi nợ</span>
          </div>
        </div>
      )}

      {/* DẠNG 6: BIỂU ĐỒ TRÒN / DONUT CƠ CẤU DOANH THU 8 CƠ SỞ */}
      {chartType === 'donut' && (
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Donut Ring */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
              <div className="relative w-52 h-52">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let cumulativeAngle = 0;
                    return branchesList.map(branch => {
                      const percent = (branch.doanhThu / totalBranchRevenue) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = -cumulativeAngle;
                      cumulativeAngle += percent;

                      const isHovered = hoveredBranch?.maChiNhanh === branch.maChiNhanh;

                      return (
                        <circle
                          key={branch.maChiNhanh}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={branch.color}
                          strokeWidth={isHovered ? '16' : '13'}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          onMouseEnter={() => setHoveredBranch(branch)}
                          onMouseLeave={() => setHoveredBranch(null)}
                          className="transition-all duration-200 cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Tổng toàn hệ thống</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {formatVND(totalBranchRevenue)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-0.5">8 Chi nhánh</span>
                </div>
              </div>
            </div>

            {/* Branch Breakdown Table List */}
            <div className="md:col-span-7 space-y-2">
              <div className="text-xs font-bold text-slate-800 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Tỷ trọng đóng góp 8 cơ sở toàn quốc:</span>
                <span className="text-[11px] text-slate-500">Thực thu tích lũy</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {branchesList.map(branch => {
                  const share = ((branch.doanhThu / totalBranchRevenue) * 100).toFixed(1);
                  const isHovered = hoveredBranch?.maChiNhanh === branch.maChiNhanh;

                  return (
                    <div
                      key={branch.maChiNhanh}
                      onMouseEnter={() => setHoveredBranch(branch)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs transition cursor-pointer ${
                        isHovered
                          ? 'bg-blue-50 border-blue-300 shadow-2xs font-bold'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: branch.color }}
                        />
                        <span className="font-mono text-[10px] text-slate-500">{branch.maChiNhanh}</span>
                        <span className="truncate text-slate-800">{branch.tenChiNhanh}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900">{formatVND(branch.doanhThu)}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[10px] font-mono font-bold">
                          {share}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive Hover Detail Card */}
      {hoveredPoint && (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-bold text-blue-400 font-mono">
              {hoveredPoint.thang}
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Doanh thu tháng {hoveredPoint.thang}</div>
              <div className="text-base font-bold text-white font-mono">{formatVND(hoveredPoint.doanhThu)}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {hoveredPoint.hocVien && (
              <div>
                <span className="text-slate-400 text-[10px] block">Học viên mới:</span>
                <span className="font-bold text-emerald-400">{hoveredPoint.hocVien} học viên</span>
              </div>
            )}
            {hoveredPoint.congNo !== undefined && (
              <div>
                <span className="text-slate-400 text-[10px] block">Công nợ tồn:</span>
                <span className="font-bold text-rose-400">{formatVND(hoveredPoint.congNo)}</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Tăng trưởng MoM:</span>
              <span
                className={`font-bold ${
                  (hoveredPoint as any).momGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(hoveredPoint as any).momGrowth >= 0 ? `+${(hoveredPoint as any).momGrowth}%` : `${(hoveredPoint as any).momGrowth}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
