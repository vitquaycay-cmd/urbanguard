---
name: brainstorm-truoc-code
description: "Dùng trước khi tạo tính năng mới, component, hoặc đổi hành vi đáng kể. Quy trình cố định: mục tiêu → ràng buộc → phương án → rủi ro → quyết định, sau đó mới viết code."
---

# Tư duy trước khi code (quy trình cố định)

## Khi nào bật quy trình này

- Thêm tính năng, màn hình, API, luồng xử lý mới.
- Đổi hành vi người dùng thấy được hoặc contract công khai.
- Refactor lớn ảnh hưởng nhiều module.

Không cần full quy cho typo một dòng hoặc đổi tên biến cục bộ — nhưng vẫn nên lướt nhanh **mục tiêu** và **ràng buộc**.

## Cổng cứng (HARD-GATE)

**Chưa hoàn thành 5 bước dưới và chưa có xác nhận của người dùng thì không:** viết code mới, scaffold, gọi skill triển khai, hay merge thay đổi hành vi.

## Checklist (làm lần lượt)

Tạo todo tương ứng từng mục nếu công việc không tầm một câu trả lời.

### 1. Mục tiêu

- Cần đạt được gì? Ai dùng? “Xong” được đo thế nào?
- Nếu mơ hồ: hỏi **một câu** mỗi lượn; ưu tiên câu trắc nghiệm (A/B/C) khi được.

### 2. Ràng buộc

- Stack, pattern hiện có, deadline, hiệu năng, bảo mật, backward compatibility.
- File / module nào **không** được đụng hoặc phải giữ nguyên contract.

### 3. Phương án (2–3 hướng)

- Mỗi hướng: ý tưởng ngắn, ưu/nhược, độ phức tạp.
- Đề xuất **một** hướng ưu tiên và lý do.

### 4. Rủi ro

- Edge case, lỗi tiềm ẩn, nợ kỹ thuật, ảnh hưởng test/CI.
- Cách giảm rủi ro (test nào, flag, rollout từng phần).

### 5. Quyết định

- Tóm tắt 1 đoạn: chọn phương án nào, vì sao, scope lần này làm gì / không làm gì (YAGNI).
- **Chờ người dùng đồng ý** (hoặc “OK tiếp”) rồi mới chuyển sang implementation.

## Sau khi quyết định

- Triển khai theo pattern dự án; test/verify theo quy ước repo.
- Nếu cần plan chi tiết nhiều bước: dùng skill **ke-hoach-trien-khai** (trong repo này; tương đương `/write-plan` / Superpowers **writing-plans**), lưu tại `docs/plans/`.
- Khi thực hiện plan: dùng skill **thuc-hien-ke-hoach** (tương đương `/execute-plan` / Superpowers **executing-plans**), bám checkbox từng task.

## Ghi chú về Superpowers `brainstorming`

Bản đầy đủ của plugin (tiếng Anh, có spec file, vòng review spec) nằm trong cache Superpowers, ví dụ:

`%USERPROFILE%\.cursor\plugins\cache\cursor-public\superpowers\...\skills\brainstorming\SKILL.md`

Skill trong thư mục này (`.agents/skills/brainstorm-truoc-code/`) là **phiên bản rút gọn tiếng Việt** bạn kiểm soát được trong repo; có thể dùng song song với Superpowers.
