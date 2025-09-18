import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { SavedPostsList } from "@/components/saved/SavedPostsList";

export default function Saved() {
  return (
    <FullScreenPageLayout title="Posts Guardados">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Tus publicaciones guardadas aparecen aquí
          </p>
        </div>
        <SavedPostsList />
      </div>
    </FullScreenPageLayout>
  );
}