import { MessageSquare, Plus } from "lucide-react";

export default function ForumHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 flex-shrink-0 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Diễn đàn cộng đồng
          </h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Chia sẻ sự cố, thảo luận và hỗ trợ cộng đồng
        </p>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        <Plus className="h-4 w-4" />
        + Tạo bài viết
      </button>
    </div>
  );
}
