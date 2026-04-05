/** Chuẩn hóa gốc URL AI (Nest dùng nối path, không có `/` cuối). */
export function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}
