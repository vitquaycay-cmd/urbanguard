-- AlterEnum: thêm VALIDATED (báo cáo đã duyệt, hiển thị bản đồ). Giữ VERIFIED cho dữ liệu cũ.
ALTER TABLE `reports` MODIFY `status` ENUM('PENDING', 'VALIDATED', 'VERIFIED', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';
