import MapWithNoSSR from "@/components/MapWithNoSSR";

/** Trải nghiệm chính: map fullscreen (Grab / Maps style). */
export default function MapPage() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-zinc-950">
      <MapWithNoSSR />
    </main>
  );
}
