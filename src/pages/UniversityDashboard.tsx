import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { UniversityDashboard } from "@/components/university/UniversityDashboard";

export default function UniversityDashboardPage() {
  return (
    <FullScreenPageLayout title="Universidad">
      <UniversityDashboard />
    </FullScreenPageLayout>
  );
}