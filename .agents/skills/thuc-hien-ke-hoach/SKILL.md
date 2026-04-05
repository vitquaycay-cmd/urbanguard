---
name: thuc-hien-ke-hoach
description: "Dùng khi đã có file plan (.md) với task/checkbox — thực hiện từng phần, có điểm dừng để review. Thay cho lệnh /execute-plan (deprecated); tương đương superpowers:executing-plans."
---

# Thực hiện kế hoạch (executing-plans — bản dự án)

**Mở đầu:** Nói rõ: *"Đang dùng skill thuc-hien-ke-hoach để thực hiện plan."*

## Quy trình

### Bước 1: Đọc và rà soát plan

1. Đọc toàn bộ file plan (đường dẫn do người dùng chỉ hoặc trong `docs/plans/`).
2. Tự đặt câu hỏi phản biện: thiếu bước verify? đường dẫn sai? phụ thuộc chưa có?
3. Có vấn đề → **hỏi người dùng / cập nhật plan** trước khi code hàng loạt.
4. Ổn → tạo **TodoWrite** bám theo từng task lớn trong plan (hoặc bám checkbox trong file).

### Bước 2: Làm từng task

Với mỗi task trong plan:

1. Đánh dấu đang làm (todo `in_progress` hoặc ghi chú trong plan nếu được phép sửa file).
2. Làm **đúng thứ tự** các bước con trong plan; **không bỏ** bước verify (chạy test, lệnh đã ghi).
3. Sau mỗi nhóm bước quan trọng: xác nhận kết quả khớp **kỳ vọng** trong plan.
4. Hoàn thành → `completed` / tick checkbox `- [x]`.

### Bước 3: Kết thúc nhánh / giao việc

Khi **tất cả** task đã xong và verify đã chạy:

- Chạy lại test/lint/build theo quy ước dự án (nếu plan chưa ghi, hỏi hoặc dùng lệnh chuẩn repo).
- Tóm tắt cho người dùng: đã làm gì, file nào đổi, cần họ kiểm tra gì.
- Nếu có skill **finishing-a-development-branch** (Superpowers): có thể dùng để gợi ý merge/PR/dọn nhánh — **không** merge `main`/`master` nếu người dùng chưa đồng ý.

## Dừng ngay và hỏi khi

- Bị chặn: thiếu dependency, test fail không rõ, hướng dẫn trong plan mơ hồ.
- Verify lặp lại vẫn fail sau khi đã thử hợp lý.
- **Không đoán mò** — hỏi người dùng hoặc đề xuất sửa plan.

## Quay lại bước 1 khi

- Người dùng sửa plan theo feedback của bạn.
- Phát hiện cách tiếp cận trong plan **sai căn bản** — cần thiết kế lại, không cố “đẩy” cho xong.

## Gợi ý môi trường

Superpowers gốc khuyến nghị **subagent / worktree** cho plan lớn. Trên Cursor, nếu không có subagent: vẫn áp dụng skill này **tuần tự** trong một phiên, chia **checkpoint** (sau mỗi task hoặc vài task) để người dùng xem diff.

## Bản gốc Superpowers

`%USERPROFILE%\.cursor\plugins\cache\cursor-public\superpowers\...\skills\executing-plans\SKILL.md`
