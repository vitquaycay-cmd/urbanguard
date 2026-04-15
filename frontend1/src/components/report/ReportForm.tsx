import { useState } from "react";

type ReportFormState = {
  image: File | null;
  type: string;
  severity: string;
  description: string;
};

export default function ReportForm() {
  const [formData, setFormData] = useState<ReportFormState>({
    image: null,
    type: "",
    severity: "",
    description: "",
  });

  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setSelectedFileName(file ? file.name : "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Report submit:", formData);
    alert("Đã bấm gửi báo cáo. Tạm thời chưa nối API.");
  };

  return (
    <div className="report-form-card">
      

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="report-upload-box">
          <div className="report-upload-icon">📷</div>
          <div className="report-upload-title">Tải ảnh sự cố lên</div>
          <div className="report-upload-sub">
            PNG, JPG, HEIC tối đa 10MB
          </div>

          <label className="report-upload-btn">
            Chọn ảnh
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {selectedFileName && (
            <div className="report-file-name">{selectedFileName}</div>
          )}
        </div>

        <div className="report-row">
          <div className="report-field">
            <label htmlFor="type">Loại sự cố</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Chọn loại sự cố</option>
              <option value="pothole">Ổ gà</option>
              <option value="flooding">Ngập nước</option>
              <option value="accident">Tai nạn</option>
              <option value="construction">Công trình</option>
              <option value="broken-light">Đèn đường hỏng</option>
            </select>
          </div>

          <div className="report-field">
            <label htmlFor="severity">Mức độ nghiêm trọng</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="">Chọn mức độ</option>
              <option value="low">Nhẹ</option>
              <option value="medium">Trung bình</option>
              <option value="high">Nghiêm trọng</option>
              <option value="critical">Khẩn cấp</option>
            </select>
          </div>
        </div>

        <div className="report-field">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            name="description"
            placeholder="Mô tả chi tiết về sự cố..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="report-submit-btn">
          🚀 Gửi báo cáo
        </button>
      </form>
    </div>
  );
}