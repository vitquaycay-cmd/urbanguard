import AppShell from "../components/layout/AppShell";
import ForumHeader from "../components/forum/ForumHeader";
import ForumFilters from "../components/forum/ForumFilters";
import ForumStats from "../components/forum/ForumStats";
import ForumPostList from "../components/forum/ForumPostList";
import "../styles/forum.css";

export default function ForumPage() {
  return (
    <AppShell
      title="Diễn đàn cộng đồng"
      subtitle="Chia sẻ sự cố, thảo luận và hỗ trợ cộng đồng"
    >
      <div className="fm-page">
        <ForumHeader />
        <ForumFilters />
        <ForumStats />
        <ForumPostList />
      </div>
    </AppShell>
  );
}