
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { StoryContent } from "./StoryContent";
import { StoryReaction } from "./StoryReaction";
import { StoryProgress } from "./StoryProgress";
import { MessageInput } from "@/components/messages/MessageInput";
import { useStory } from "@/hooks/use-story";
import { ReactionType } from "@/types/database/social.types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserStory {
  userId: string;
  username: string;
  avatarUrl: string | null;
  storyIds: string[];
  hasUnviewed: boolean;
}

interface FullScreenStoriesViewerProps {
  initialStoryId: string;
  currentUserId: string;
  onClose: () => void;
}

export function FullScreenStoriesViewer({ 
  initialStoryId, 
  currentUserId, 
  onClose 
}: FullScreenStoriesViewerProps) {
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const currentUserStory = userStories[currentUserIndex];
  const currentStoryId = currentUserStory?.storyIds[currentStoryIndex];
  
  const { storyData, timeDisplay } = useStory(currentStoryId || "");
  
  const { progress } = StoryProgress({
    isPaused,
    currentImageIndex: currentStoryIndex,
    totalImages: currentUserStory?.storyIds.length || 1,
    onComplete: handleNextUser,
    onImageComplete: handleNextStory,
    duration: 5000
  });

  useEffect(() => {
    // Force refresh stories when component mounts
    console.log('🔄 FullScreenStoriesViewer mounted, fetching stories');
    fetchAllUserStories();
  }, [currentUserId]);

  useEffect(() => {
    // Find the initial story and set the correct indices
    if (userStories.length > 0 && initialStoryId) {
      console.log('🔍 Finding initial story:', initialStoryId, 'in stories:', userStories);
      for (let userIndex = 0; userIndex < userStories.length; userIndex++) {
        const storyIndex = userStories[userIndex].storyIds.indexOf(initialStoryId);
        if (storyIndex !== -1) {
          console.log('✅ Found initial story at user', userIndex, 'story', storyIndex);
          setCurrentUserIndex(userIndex);
          setCurrentStoryIndex(storyIndex);
          break;
        }
      }
    }
  }, [userStories, initialStoryId]);

  const fetchAllUserStories = async () => {
    try {
      console.log('🔄 Fetching all user stories for:', currentUserId);
      const now = new Date().toISOString();
      
      // Get user's friends
      const { data: friendsData } = await (supabase as any)
        .from('friendships')
        .select('friend_id')
        .eq('user_id' as any, currentUserId as any)
        .eq('status' as any, 'accepted' as any);
      
      const friendIds = friendsData ? (friendsData as any[]).map((f: any) => f.friend_id) : [];
      const userIds = [currentUserId, ...friendIds];
      
      // Get all stories
      const { data: storiesData, error } = await (supabase as any)
        .from('stories')
        .select('id, user_id, created_at, expires_at')
        .in('user_id', userIds)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const uniqueUserIds = [...new Set((((storiesData as any[]) || []).map((story: any) => story.user_id)))] as string[];
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', uniqueUserIds as any);
      
      const profilesMap = new Map(((((profilesData as any[]) || []).map((p: any) => [p.id, p]))));

      // Declare and type the users map to collect grouped stories per user
      const usersMap = new Map<string, UserStory>();
      
      const { data: viewsData } = await (supabase as any)
        .from('story_views')
        .select('story_id')
        .eq('viewer_id' as any, currentUserId as any);
      
      const viewedStoryIds = new Set(((((viewsData as any[]) || []).map((v: any) => v.story_id)) || []));
      
      (((storiesData as any[]) || [])).forEach((story: any) => {
        const userId = story.user_id as string;
        const profile = profilesMap.get(userId);
        
        if (!usersMap.has(userId)) {
          usersMap.set(userId, {
            userId,
            username: profile?.username || 'Usuario',
            avatarUrl: profile?.avatar_url || null,
            storyIds: [],
            hasUnviewed: false
          });
        }
        
        const user = usersMap.get(userId)!;
        user.storyIds.push(story.id);
        
        if (!viewedStoryIds.has(story.id)) {
          user.hasUnviewed = true;
        }
      });
      
      const userStoriesArray: UserStory[] = Array.from(usersMap.values());
      
      // Sort: current user first, then unseen stories, then rest
      userStoriesArray.sort((a, b) => {
        if (a.userId === currentUserId) return -1;
        if (b.userId === currentUserId) return 1;
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        return 0;
      });
      
      console.log('📊 Final user stories array:', userStoriesArray);
      setUserStories(userStoriesArray);
    } catch (error) {
      console.error("❌ Error fetching user stories:", error);
    }
  };

  function handleNextStory() {
    if (currentUserStory && currentStoryIndex < currentUserStory.storyIds.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      handleNextUser();
    }
  }

  function handlePrevStory() {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      handlePrevUser();
    }
  }

  function handleNextUser() {
    if (currentUserIndex < userStories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }

  function handlePrevUser() {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(0);
    }
  }

  const handleUserStoryClick = (userIndex: number) => {
    console.log('👆 User story clicked:', userIndex, userStories[userIndex]?.username);
    setCurrentUserIndex(userIndex);
    setCurrentStoryIndex(0);
  };

  const handleReaction = async (type: ReactionType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !currentStoryId) return;

      const { data: existingReaction } = await (supabase as any)
        .from('story_reactions')
        .select()
        .eq('story_id' as any, currentStoryId as any)
        .eq('user_id' as any, session.user.id as any)
        .maybeSingle();

      if (existingReaction) {
        if ((existingReaction as any).reaction_type === type) {
          await (supabase as any)
            .from('story_reactions')
            .delete()
            .eq('id' as any, (existingReaction as any).id as any);
        } else {
          await (supabase as any)
            .from('story_reactions')
            .update({ reaction_type: type } as any)
            .eq('id' as any, (existingReaction as any).id as any);
        }
      } else {
        await (supabase as any)
          .from('story_reactions')
          .insert({
            story_id: currentStoryId,
            user_id: session.user.id,
            reaction_type: type
          } as any);
      }

      toast({
        title: "Reacción enviada",
        description: "Has reaccionado a esta historia"
      });
    } catch (error) {
      console.error("Error sending reaction:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserStory) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await (supabase as any)
        .from('messages')
        .insert({
          sender_id: session.user.id,
          receiver_id: currentUserStory.userId,
          content: newMessage.trim()
        } as any);

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Mensaje enviado",
        description: `Mensaje enviado a ${currentUserStory.username}`
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  if (!storyData || !currentUserStory) {
    return null;
  }

  // Mobile version
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Mobile Story View */}
        <div className="relative h-full bg-black flex flex-col">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
            {currentUserStory.storyIds.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                {index < currentStoryIndex ? (
                  <div className="bg-white h-1 w-full" />
                ) : index === currentStoryIndex ? (
                  <div 
                    className="bg-white h-1 transition-all duration-100 ease-linear" 
                    style={{ width: `${progress}%` }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          {/* Mobile header */}
          <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={storyData.user?.avatarUrl || undefined} alt={`Avatar de ${storyData.user?.username ?? 'Usuario'}`} loading="lazy" />
                <AvatarFallback>{storyData.user?.username?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{storyData.user?.username}</p>
                <p className="text-sm opacity-80">{timeDisplay}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setShowUsersList(!showUsersList)}
                aria-label="Ver lista de usuarios"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
                aria-label="Cerrar historias"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile users list overlay */}
          {showUsersList && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/90 z-30 flex flex-col">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center justify-between text-white">
                  <h2 className="text-lg font-semibold">Historias</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowUsersList(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {userStories.map((userStory, index) => (
                  <div
                    key={userStory.userId}
                    onClick={() => {
                      handleUserStoryClick(index);
                      setShowUsersList(false);
                    }}
                    className={`p-4 cursor-pointer hover:bg-white/10 transition-colors ${
                      index === currentUserIndex ? 'bg-white/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`relative ${userStory.hasUnviewed ? 'ring-2 ring-primary rounded-full' : ''}`}>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userStory.avatarUrl || undefined} alt={`Avatar de ${userStory.username}`} loading="lazy" />
                          <AvatarFallback>{userStory.username[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-white">{userStory.username}</p>
                        <p className="text-sm text-white/70">
                          {userStory.storyIds.length} historia{userStory.storyIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Story content */}
          <StoryContent
            mediaItems={storyData.mediaItems || []}
            currentIndex={0}
            onContentClick={() => setIsPaused(!isPaused)}
            onNextImage={handleNextStory}
            onPrevImage={handlePrevStory}
            isPaused={isPaused}
            className="flex-1"
          />

          {/* Mobile navigation areas */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-4"
            onClick={handlePrevStory}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-4"
            onClick={handleNextStory}
          />

          {/* Reactions */}
          {showReactions && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
              <StoryReaction
                storyId={currentStoryId || ""}
                showReactions={true}
                onReact={handleReaction}
              />
            </div>
          )}

          {/* Mobile bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowReactions(!showReactions)}
              >
                😍
              </Button>
            </div>
            
            <div className="flex-1">
              <MessageInput
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Left Sidebar - Stories List */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Historias</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {userStories.map((userStory, index) => (
            <div
              key={userStory.userId}
              onClick={() => handleUserStoryClick(index)}
              className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                index === currentUserIndex ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`relative ${userStory.hasUnviewed ? 'ring-2 ring-primary rounded-full' : ''}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userStory.avatarUrl || undefined} alt={`Avatar de ${userStory.username}`} loading="lazy" />
                    <AvatarFallback>{userStory.username[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{userStory.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {userStory.storyIds.length} historia{userStory.storyIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Story View */}
      <div className="flex-1 relative bg-black flex flex-col">
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {currentUserStory.storyIds.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              {index < currentStoryIndex ? (
                <div className="bg-white h-1 w-full" />
              ) : index === currentStoryIndex ? (
                <div 
                  className="bg-white h-1 transition-all duration-100 ease-linear" 
                  style={{ width: `${progress}%` }}
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* Story header */}
        <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={storyData.user?.avatarUrl || undefined} alt={`Avatar de ${storyData.user?.username ?? 'Usuario'}`} loading="lazy" />
              <AvatarFallback>{storyData.user?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{storyData.user?.username}</p>
              <p className="text-sm opacity-80">{timeDisplay}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? "Reanudar historia" : "Pausar historia"}
            >
              {isPaused ? "▶️" : "⏸️"}
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handlePrevStory}
            aria-label="Historia anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleNextStory}
            aria-label="Siguiente historia"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Story content */}
        <StoryContent
          mediaItems={storyData.mediaItems || []}
          currentIndex={0}
          onContentClick={() => setIsPaused(!isPaused)}
          onNextImage={handleNextStory}
          onPrevImage={handlePrevStory}
          isPaused={isPaused}
          className="flex-1"
        />

        {/* Reactions */}
        {showReactions && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
            <StoryReaction
              storyId={currentStoryId || ""}
              showReactions={true}
              onReact={handleReaction}
            />
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowReactions(!showReactions)}
            >
              😍
            </Button>
          </div>
          
          <div className="flex-1">
            <MessageInput
              newMessage={newMessage}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
