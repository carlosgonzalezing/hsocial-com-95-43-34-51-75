
import React from "react";
import { PostCreatorCompact } from "@/components/PostCreatorCompact";
import { PostCreatorModal } from "@/components/PostCreatorModal";
import { Feed } from "@/components/feed/Feed";
import { FacebookLayout } from "@/components/layout/FacebookLayout";
import { StoryBanner } from "@/components/stories/StoryBanner";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function Index() {
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  const [openWithMedia, setOpenWithMedia] = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState<any>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const handleOpenModal = () => {
    setOpenWithMedia(false);
    setSelectedMood(null);
    setSelectedFile(null);
    setIsPostModalOpen(true);
  };

  const handleOpenModalWithMedia = () => {
    setOpenWithMedia(true);
    setSelectedMood(null);
    setSelectedFile(null);
    setIsPostModalOpen(true);
  };

  const handleFileDrop = (file: File) => {
    setSelectedFile(file);
    setOpenWithMedia(true);
    setSelectedMood(null);
    setIsPostModalOpen(true);
  };

  const handleMoodSelect = (type: 'mood' | 'activity', item: any) => {
    setSelectedMood({ ...item, type });
    setOpenWithMedia(false);
    setSelectedFile(null);
    setIsPostModalOpen(true);
  };

  return (
    <FacebookLayout>
      <div className="w-full space-y-1">
        {/* Creador de publicaciones compacto */}
        <PostCreatorCompact 
          onOpenModal={handleOpenModal}
          onOpenWithMedia={handleOpenModalWithMedia}
          onFileDrop={handleFileDrop}
          onMoodSelect={handleMoodSelect}
        />
        
        {/* Banner de historias */}
        {user?.id && (
          <StoryBanner currentUserId={user.id} />
        )}

        {/* Feed de publicaciones */}
        <Feed />
      </div>

      {/* Modal del creador de publicaciones */}
      <PostCreatorModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
        focusOnOpen={!openWithMedia && !selectedMood}
        openWithMedia={openWithMedia}
        selectedMood={selectedMood}
        selectedFile={selectedFile}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={completeOnboarding}
        onComplete={completeOnboarding}
      />
    </FacebookLayout>
  );
}
