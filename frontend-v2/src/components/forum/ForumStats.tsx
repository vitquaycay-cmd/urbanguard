import { FileText, MessageSquare, Users } from "lucide-react";

export default function ForumStats() {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">1.248</div>
            <div className="text-xs text-gray-400">Bài viết</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">3.847</div>
            <div className="text-xs text-gray-400">Thành viên</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">12.691</div>
            <div className="text-xs text-gray-400">Bình luận</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-semibold text-green-600">247 online</span>
      </div>
    </div>
  );
}
