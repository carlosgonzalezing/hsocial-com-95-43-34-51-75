import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { TrendingPostsList } from "@/components/trends/TrendingPostsList";

export default function Trends() {
  return (
    <FullScreenPageLayout title="Tendencias">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Descubre las publicaciones más populares y en tendencia
          </p>
        </div>
        <TrendingPostsList />
      </div>
    </FullScreenPageLayout>
  );
}