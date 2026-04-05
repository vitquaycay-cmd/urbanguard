---
name: ke-hoach-trien-khai
description: "Dùng khi đã có spec / yêu cầu rõ và công việc nhiều bước — trước khi sửa code. Thay cho lệnh /write-plan (deprecated); tương đương superpowers:writing-plans."
---

# Kế hoạch triển khai (writing-plans — bản dự án)

**Mở đầu:** Nói rõ: *"Đang dùng skill ke-hoach-trien-khai để lập kế hoạch triển khai."*

## Mục tiêu

Viết **plan triển khai** đủ chi tiết để người/khác hoặc agent **không cần đoán**: file nào đụng, test gì, lệnh chạy, kỳ vọng output. Nguyên tắc: DRY, YAGNI, TDD khi phù hợp, commit nhỏ thường xuyên.

Giả định người thực hiện **giỏi code** nhưng **không quen domain / cấu trúc repo** — plan phải tự giải thích.

## Lưu file plan

**Mặc định dự án:** `docs/plans/YYYY-MM-DD-<ten-tinh-nang>.md`

Nếu team quy định chỗ khác (ví dụ chỉ trong issue), ghi đè trong plan và tuân theo quy ước đó.

## Kiểm tra phạm vi

- Nếu một “mảng” spec thực ra là **nhiều hệ độc lập**, tách thành **nhiều plan** (mỗi plan ra được phần mềm chạy/test được riêng).
- Nếu chưa tách: đề xuất tách trước khi viết task chi tiết.

## Cấu trúc file & phân rã task

Trước khi liệt kê từng bước:

- Liệt kê file **tạo mới / sửa / test** và **trách nhiệm** từng file.
- Ưu tiên file nhỏ, một nhiệm vụ rõ; bám pattern repo hiện có.
- Mỗi task trong plan là **một hành động ngắn** (khoảng 2–5 phút ý tưởng): viết test fail → chạy thấy fail → code tối thiểu → chạy pass → commit (nếu dùng TDD).

## Header bắt buộc ở đầu file plan

```markdown
# [Tên tính năng] — Kế hoạch triển khai

> **Cho agent:** Sau khi có plan, dùng skill **thuc-hien-ke-hoach** để làm lần lượt từng task; đánh dấu checkbox `- [ ]` / `- [x]` theo tiến độ.

**Mục tiêu:** [một câu]

**Kiến trúc / hướng tiếp cận:** [2–3 câu]

**Stack / công cụ:** [liệt kê ngắn]

---
```

## Mẫu từng task trong plan

````markdown
### Task N: [Tên phần việc]

**File:**
- Tạo: `duong/dan/chinh/xac.py`
- Sửa: `duong/dan/cu.py` (khu vực chức năng …)
- Test: `tests/...`

- [ ] **Bước 1: …** (mô tả; nếu TDD thì có đoạn test mẫu)

- [ ] **Bước 2: Chạy kiểm tra**

Chạy: `…`
Kỳ vọng: …

- [ ] **Bước 3: Commit** (nếu áp dụng)

```bash
git add …
git commit -m "…"
```
````

## Nhớ

- Đường dẫn file **chính xác**; lệnh terminal **cụ thể**; kỳ vọng **PASS/FAIL** rõ.
- Tránh mơ hồ kiểu “thêm validation” — nên có gợi ý cụ thể hoặc pseudo-code khi cần.

## Sau khi viết xong plan

1. Tự rà soát một lượt (hoặc nhờ người khác đọc).
2. Báo người dùng: plan đã lưu tại `docs/plans/...`.
3. Giao tiếp theo: *"Thực hiện trong phiên này bằng skill **thuc-hien-ke-hoach**, hoặc mở phiên mới chỉ để execute plan."*

## Bản gốc Superpowers

Bản đầy đủ (tiếng Anh, vòng review bằng subagent, `docs/superpowers/plans/`) nằm trong cache plugin:

`%USERPROFILE%\.cursor\plugins\cache\cursor-public\superpowers\...\skills\writing-plans\SKILL.md`
