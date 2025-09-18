import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { GroupsController } from "@/components/groups/GroupsController";

const Groups = () => {
  return (
    <FullScreenPageLayout title="Grupos">
      <GroupsController />
    </FullScreenPageLayout>
  );
};

export default Groups;