/**
 * Sao chép một ảnh bất kỳ vào thư mục cố định để mỗi lần test upload
 * (Swagger / Postman) chỉ cần chọn lại cùng một đường dẫn.
 *
 * Usage (từ thư mục backend):
 *   npm run fixture:report-image -- "C:\path\to\photo.jpg"
 *   npm run fixture:report-image -- ../my-image.png
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_DIR = path.join(__dirname, "..", "test-fixtures", "report-images");

const srcArg = process.argv[2];
if (!srcArg || srcArg === "-h" || srcArg === "--help") {
  console.log(`
UrbanGuard — copy ảnh vào test-fixtures/report-images/current.<ext>

  npm run fixture:report-image -- "<đường-dẫn-ảnh>"

Sau đó trong Swagger POST /reports, field image → chọn file:
  backend/test-fixtures/report-images/current.<đuôi>
`);
  process.exit(srcArg ? 0 : 1);
}

const src = path.resolve(process.cwd(), srcArg);
if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
  console.error(`Không tìm thấy file: ${src}`);
  process.exit(1);
}

const ext = path.extname(src).toLowerCase();
const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const safeExt = allowed.includes(ext) ? ext : ".jpg";

fs.mkdirSync(DEST_DIR, { recursive: true });

for (const e of [".jpg", ".jpeg", ".png", ".gif", ".webp"]) {
  const p = path.join(DEST_DIR, `current${e}`);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

const dest = path.join(DEST_DIR, `current${safeExt}`);
fs.copyFileSync(src, dest);

console.log(`Đã copy:\n  ${dest}\n`);
console.log(
  "Swagger: POST /reports → chọn file trên; JWT Bearer trong Authorize.\n",
);
