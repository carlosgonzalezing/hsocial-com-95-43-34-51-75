import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { OpportunitiesHub } from "@/components/opportunities/OpportunitiesHub";

export default function Opportunities() {
  return (
    <FullScreenPageLayout title="OpHub">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <OpportunitiesHub />
      </div>
    </FullScreenPageLayout>
  );
}