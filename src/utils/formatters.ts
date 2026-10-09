/**
 * Utility formatters for KIẾN TRẺ Education Management System
 */

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('₫', 'VNĐ');
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

// Convert number to Vietnamese text (e.g. 5,000,000 -> "Năm triệu đồng chẵn")
const chuSo = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function docBaChuSo(baso: number, showZeroHundred: boolean = true): string {
  const tram = Math.floor(baso / 100);
  const chuc = Math.floor((baso % 100) / 10);
  const donvi = baso % 10;
  let ketqua = '';

  if (tram > 0 || showZeroHundred) {
    ketqua += `${chuSo[tram]} trăm `;
  }

  if (chuc > 1) {
    ketqua += `${chuSo[chuc]} mươi `;
    if (donvi === 1) ketqua += 'mốt ';
    else if (donvi === 5) ketqua += 'lăm ';
    else if (donvi > 0) ketqua += `${chuSo[donvi]} `;
  } else if (chuc === 1) {
    ketqua += 'mười ';
    if (donvi === 5) ketqua += 'lăm ';
    else if (donvi > 0) ketqua += `${chuSo[donvi]} `;
  } else if (donvi > 0) {
    if (tram > 0 || showZeroHundred) ketqua += 'lẻ ';
    ketqua += `${chuSo[donvi]} `;
  }

  return ketqua.trim();
}

export function numberToWordsVietnamese(so: number): string {
  if (so === 0) return 'Không đồng';
  if (so < 0) return 'Trừ ' + numberToWordsVietnamese(Math.abs(so));

  let soDu = Math.round(so);
  const hangDonVi = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  let viTri = 0;
  let doc = '';

  while (soDu > 0) {
    const baso = soDu % 1000;
    if (baso > 0) {
      const showZero = soDu >= 1000;
      const chuoiBaSo = docBaChuSo(baso, showZero);
      const donVi = hangDonVi[viTri] ? ` ${hangDonVi[viTri]}` : '';
      doc = `${chuoiBaSo}${donVi} ${doc}`.trim();
    }
    soDu = Math.floor(soDu / 1000);
    viTri++;
  }

  // Capitalize first letter and append "đồng chẵn"
  const formatted = doc.charAt(0).toUpperCase() + doc.slice(1) + ' đồng chẵn';
  return formatted.replace(/\s+/g, ' ');
}
