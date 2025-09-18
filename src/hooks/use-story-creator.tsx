
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { StoryVisibility, uploadStory, validateStoryFile } from "@/components/stories/utils/story-utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useStoryCreator(currentUserId: string, onComplete: () => void) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [visibility, setVisibility] = useState<StoryVisibility>('public');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<{username: string; avatarUrl: string | null}>({
    username: '',
    avatarUrl: null
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUserId)
          .single();
          
        if (profileError) throw profileError;
        
        setUserProfile({
          username: profileData.username,
          avatarUrl: profileData.avatar_url
        });
        
        // Use casting to bypass type checking for RPC call
        const rpcCall = supabase.rpc as any;
        const { data: privacyData, error: privacyError } = await rpcCall('get_user_story_privacy', { 
          user_id_input: currentUserId 
        });
        
        // Validate the data is a valid StoryVisibility value
        if (!privacyError && privacyData && typeof privacyData === 'string' && 
            (privacyData === 'public' || privacyData === 'friends' || 
             privacyData === 'select' || privacyData === 'except')) {
          setVisibility(privacyData as StoryVisibility);
        } else {
          // Default to public if there's an error or no setting
          setVisibility('public');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    
    fetchUserData();
  }, [currentUserId]);

  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];
    
    newFiles.forEach(file => {
      if (validateStoryFile(file)) {
        validFiles.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    });
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    setIsEditing(true);
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    
    if (currentPreviewIndex >= previewUrls.length - 1) {
      setCurrentPreviewIndex(Math.max(0, previewUrls.length - 2));
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos una imagen para tu historia.",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('📤 Starting story upload process...');
      
      // Upload each image and create a story for each
      for (const file of files) {
        const result = await uploadStory(file, currentUserId, visibility);
        if (!result) {
          throw new Error("Failed to upload story");
        }
      }
      
      console.log('✅ All stories uploaded successfully');
      
      // Invalidate all story-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      queryClient.removeQueries({ queryKey: ["story"] }); // Remove all individual story cache
      
      console.log('🔄 Story cache invalidated');
      
      toast({
        title: "¡Historia creada!",
        description: `Tu historia con ${files.length} imagen${files.length > 1 ? 'es' : ''} estará disponible durante 24 horas.`,
      });
      
      onComplete();
    } catch (error) {
      console.error("❌ Error creating story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la historia. Inténtalo de nuevo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    files,
    previewUrls,
    isUploading,
    currentPreviewIndex,
    setCurrentPreviewIndex,
    visibility,
    setVisibility,
    isEditing,
    setIsEditing,
    userProfile,
    addFiles,
    removeImage,
    handleSubmit
  };
}
