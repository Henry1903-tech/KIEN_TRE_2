import QRCode from 'qrcode';

export function generateNextStudentCode(existingCodes: string[]): string {
  const numbers = existingCodes
    .map(c => {
      const match = c.match(/HV(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `HV${String(max + 1).padStart(3, '0')}`;
}

export function generateNextClassCode(maKH: string, existingCodes: string[]): string {
  const prefix = `${maKH}-L`;
  const numbers = existingCodes
    .filter(c => c.startsWith(prefix))
    .map(c => {
      const numPart = c.replace(prefix, '');
      return parseInt(numPart, 10);
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `${prefix}${String(max + 1).padStart(2, '0')}`;
}

export function generateNextCourseCode(existingCodes: string[]): string {
  const numbers = existingCodes
    .map(c => {
      const match = c.match(/K(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `K${String(max + 1).padStart(3, '0')}`;
}

export function generateNextEmployeeCode(existingCodes: string[]): string {
  const numbers = existingCodes
    .map(c => {
      const match = c.match(/NV(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `NV${String(max + 1).padStart(3, '0')}`;
}

export function generateNextEnrollmentCode(existingCodes: string[]): string {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `PGD-${yyyymmdd}-`;
  const countToday = existingCodes.filter(c => c.startsWith(prefix)).length;
  return `${prefix}${String(countToday + 1).padStart(3, '0')}`;
}

export function generateNextInvoiceCode(existingCodes: string[]): string {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `HD-${yyyymmdd}-`;
  const countToday = existingCodes.filter(c => c.startsWith(prefix)).length;
  return `${prefix}${String(countToday + 1).padStart(3, '0')}`;
}

export function generateNextBranchCode(existingCodes: string[]): string {
  const numbers = existingCodes
    .map(c => {
      const match = c.match(/CN(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `CN${String(max + 1).padStart(2, '0')}`;
}

export function generateNextPaymentCode(existingCodes: string[]): string {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `TT-${yyyymmdd}-`;
  const countToday = existingCodes.filter(c => c.startsWith(prefix)).length;
  return `${prefix}${String(countToday + 1).padStart(3, '0')}`;
}

/**
 * Generate VietQR Standard payment QR
 * Bank: Vietcombank (970436)
 * Account: 1028889999 (KIEN TRE Company Account)
 */
export async function generateVietQRDataURL(
  amount: number,
  content: string,
  accountNo: string = '1028889999',
  accountName: string = 'CONG TY CP DAU TU GIAO DUC KIEN TRE'
): Promise<string> {
  // VietQR standard text representation for bank apps
  const qrString = `2|99|00020101021238580010A000000727012600069704150112${accountNo}0208QRIBFTTA52046011530370454${amount}5802VN62${content.length}${content}6304`;
  try {
    return await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
