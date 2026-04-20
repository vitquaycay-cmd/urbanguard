import ForumHeader from "@/components/forum/ForumHeader";
import ForumFilters from "@/components/forum/ForumFilters";
import ForumStats from "@/components/forum/ForumStats";
import ForumPostList from "@/components/forum/ForumPostList";

export default function ForumPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <ForumHeader />
      <ForumFilters />
      <ForumStats />
      <ForumPostList />
    </div>
  );
}
