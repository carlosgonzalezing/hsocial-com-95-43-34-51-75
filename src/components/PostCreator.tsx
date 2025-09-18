import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mobileToasts } from "@/components/ui/mobile-toast";
import { supabase } from "@/integrations/supabase/client";
import { AttachmentInput } from "./AttachmentInput";
import { AttachmentPreview } from "./AttachmentPreview";
import { VisibilitySelector } from "./post/VisibilitySelector";
import { PollCreator } from "./post/PollCreator";
import { MarketplaceCreator } from "./post/MarketplaceCreator";
import { PostCreatorHeader } from "./post/PostCreatorHeader";
import { PostContentInput } from "./post/PostContentInput";
import { TextBackgroundPalette, ContentStyle, backgroundPresets } from "./post/TextBackgroundPalette";
import { uploadMediaFile, getMediaType } from "@/lib/api/posts/storage";
import { v4 as uuidv4 } from "uuid";
import { useDraft } from "@/hooks/use-draft";
import { useAutoResize } from "@/hooks/use-auto-resize";

export interface Poll {
  question: string;
  options: string[];
  multiple_choice: boolean;
  expires_at: string;
}

export interface Idea {
  title: string;
  description: string;
  required_skills: string[];
  max_participants: number;
  deadline?: string;
}

export interface Marketplace {
  type: 'selling' | 'buying' | 'service';
  title: string;
  description: string;
  price?: number;
  location?: string;
  contact_info: string;
}

type PostType = 'regular' | 'poll' | 'idea' | 'marketplace';
type Visibility = 'public' | 'friends' | 'private' | 'incognito';

interface PostCreatorProps {
  onPostCreated?: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  openWithMedia?: boolean;
  initialContent?: string;
  selectedFile?: File | null;
}

export function PostCreator({ 
  onPostCreated,
  textareaRef: externalTextareaRef,
  openWithMedia = false,
  initialContent = "",
  selectedFile: initialFile = null
}: PostCreatorProps = {}) {
  const [content, setContent] = useState(initialContent);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [postType, setPostType] = useState<PostType>("regular");
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentStyle, setContentStyle] = useState<ContentStyle>({
    backgroundKey: 'none',
    textColor: 'text-foreground',
    isTextOnly: false
  });
  const [poll, setPoll] = useState<Poll>({
    question: "",
    options: ["", ""],
    multiple_choice: false,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });
  const [idea, setIdea] = useState<Idea>({
    title: "",
    description: "",
    required_skills: [],
    max_participants: 5
  });
  const [marketplace, setMarketplace] = useState<Marketplace>({
    type: 'selling',
    title: "",
    description: "",
    contact_info: ""
  });

  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finalTextareaRef = externalTextareaRef || textareaRef;
  const { clearDraft } = useDraft(content, setContent);

  // Auto-resize hook for textarea
  const autoResizeRef = useAutoResize<HTMLTextAreaElement>(content);

  // Set initial content when component mounts
  useEffect(() => {
    if (initialContent && !content) {
      setContent(initialContent);
    }
    if (initialFile && !selectedFile) {
      setSelectedFile(initialFile);
    }
  }, [initialContent, initialFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isFormValid() && !isUploading) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, selectedFile, postType, poll, idea, marketplace, isUploading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('File selected:', { name: file.name, size: file.size, type: file.type });
      setSelectedFile(file);
    }
  };

  const removeAttachment = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('User not authenticated, cannot create post');
        mobileToasts.error("Debes iniciar sesión para crear un post");
        return;
      }

      if (!content.trim() && !selectedFile && postType === 'regular') {
        mobileToasts.validationError("Contenido o archivo");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      // Upload file if present
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        setUploadProgress(25);
        
        try {
          mediaUrl = await uploadMediaFile(selectedFile);
          mediaType = getMediaType(selectedFile);
          setUploadProgress(50);
          console.log('File uploaded successfully:', { mediaUrl, mediaType });
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          mobileToasts.error("Error al subir el archivo");
          setIsUploading(false);
          return;
        }
      }

      setUploadProgress(75);

      let visibilityValue: "public" | "friends" | "private" = visibility as "public" | "friends" | "private";
      if (visibility === 'incognito') {
        visibilityValue = 'private';
      }

      // Create post data
      const postData: any = {
        user_id: session.user.id,
        content: content.trim() || null,
        visibility: visibilityValue,
        media_url: mediaUrl,
        media_type: mediaType,
        post_type: postType,
        content_style: contentStyle.backgroundKey !== 'none' ? contentStyle : null
      };

      // Add type-specific data
      if (postType === 'poll' && poll.question.trim()) {
        postData.poll = {
          question: poll.question,
          options: poll.options.map((option, index) => ({
            id: index,
            text: option,
            votes: 0,
            percentage: 0
          }))
        };
      }
      
      if (postType === 'idea' && idea.title.trim()) {
        postData.idea = {
          title: idea.title,
          description: idea.description,
          required_skills: idea.required_skills,
          max_participants: idea.max_participants,
          deadline: idea.deadline || null
        };
      }

      if (postType === 'marketplace' && marketplace.title.trim()) {
        postData.marketplace = marketplace;
      }

      console.log("Creating post with data:", postData);
      setUploadProgress(90);
      
      // Insert post
      const { data: newPost, error: postError } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw postError;
      }

      console.log('Post created successfully:', newPost);
      setUploadProgress(100);

      mobileToasts.postCreated();

      // Call onPostCreated callback if provided
      onPostCreated?.();

      // Clear draft after successful post
      clearDraft();

      // Reset form
      setContent("");
      setVisibility("public");
      setPostType("regular");
      setSelectedFile(null);
      setContentStyle({
        backgroundKey: 'none',
        textColor: 'text-foreground',
        isTextOnly: false
      });
      setPoll({
        question: "",
        options: ["", ""],
        multiple_choice: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
      setIdea({
        title: "",
        description: "",
        required_skills: [],
        max_participants: 5
      });
      setMarketplace({
        type: 'selling',
        title: "",
        description: "",
        contact_info: ""
      });
    } catch (error) {
      console.error("Error creating post:", error);
      mobileToasts.error("Error al crear la publicación");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isFormValid = () => {
    try {
      if (postType === 'regular') {
        // For text-only posts with backgrounds, limit content length
        if (contentStyle.isTextOnly && content.length > 280) {
          return false;
        }
        return Boolean(content.trim() || selectedFile);
      } else if (postType === 'poll') {
        return Boolean(
          poll.question.trim() && 
          poll.options.length >= 2 && 
          poll.options.every(opt => opt.trim()) &&
          poll.options.filter(opt => opt.trim()).length >= 2
        );
      } else if (postType === 'idea') {
        return Boolean(
          idea.title.trim() && 
          idea.description.trim() &&
          idea.title.trim().length >= 5 &&
          idea.description.trim().length >= 10 &&
          idea.max_participants > 0 &&
          idea.max_participants <= 50
        );
      } else if (postType === 'marketplace') {
        return Boolean(
          marketplace.title.trim() && 
          marketplace.description.trim() && 
          marketplace.contact_info.trim() &&
          marketplace.title.trim().length >= 5 &&
          marketplace.description.trim().length >= 10 &&
          ['selling', 'buying', 'service'].includes(marketplace.type)
        );
      }
      return false;
    } catch (error) {
      console.error('Form validation error:', error);
      return false;
    }
  };

  return (
    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-full overflow-hidden">
      <PostCreatorHeader 
        postType={postType} 
        setPostType={setPostType}
      />
      
      {postType === 'regular' && (
        <PostContentInput
          content={content}
          setContent={setContent}
          textareaRef={finalTextareaRef}
          contentStyle={contentStyle}
        />
      )}

      {postType === 'regular' && !selectedFile && (
        <TextBackgroundPalette
          selectedBackground={contentStyle.backgroundKey}
          onBackgroundChange={setContentStyle}
          disabled={!!selectedFile}
        />
      )}

      {postType === 'poll' && (
        <PollCreator poll={poll} setPoll={setPoll} />
      )}

      {postType === 'idea' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="idea-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Título de la idea
            </label>
            <Textarea
              id="idea-title"
              placeholder="Ej: App para conectar estudiantes"
              value={idea.title}
              onChange={(e) => setIdea({ ...idea, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Descripción
            </label>
            <Textarea
              id="idea-description"
              placeholder="Describe tu idea en detalle"
              value={idea.description}
              onChange={(e) => setIdea({ ...idea, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-skills" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Habilidades requeridas
            </label>
            <Textarea
              id="idea-skills"
              placeholder="Ej: React, Node.js, Diseño UI"
              value={idea.required_skills.join(', ')}
              onChange={(e) => setIdea({ ...idea, required_skills: e.target.value.split(',').map(s => s.trim()) })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-participants" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Máximo participantes
            </label>
            <input
              type="number"
              id="idea-participants"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="5"
              value={idea.max_participants}
              onChange={(e) => setIdea({ ...idea, max_participants: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="idea-deadline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Fecha límite (opcional)
            </label>
            <input
              type="datetime-local"
              id="idea-deadline"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={idea.deadline || ""}
              onChange={(e) => setIdea({ ...idea, deadline: e.target.value })}
            />
          </div>
        </div>
      )}

      {postType === 'marketplace' && (
        <MarketplaceCreator 
          marketplace={marketplace} 
          setMarketplace={setMarketplace} 
        />
      )}

      {postType === 'regular' && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <AttachmentInput
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              type="image"
              label="Fotos y Videos"
              showLabel={true}
              buttonSize="sm"
              buttonClassName="flex-1 sm:flex-none justify-center"
              accept="image/*,video/*"
            />
            <AttachmentInput
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              type="file"
              showLabel={true}
              label="Archivos"
              buttonSize="sm"
              buttonClassName="flex-1 sm:flex-none justify-center"
              accept="*/*"
            />
          </div>

          {selectedFile && (
            <AttachmentPreview
              previews={[URL.createObjectURL(selectedFile)]}
              files={[selectedFile]}
              onRemove={removeAttachment}
              className="w-full"
              previewClassName="w-full h-40 sm:h-48 object-cover rounded-lg"
            />
          )}
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
        <VisibilitySelector 
          visibility={visibility}
          setVisibility={setVisibility}
        />
        
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isUploading}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 text-base sm:text-sm font-medium hover-scale touch-manipulation"
            size="lg"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Publicando... {uploadProgress}%
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Publicar
                <span className="hidden sm:inline text-xs opacity-70">Ctrl+Enter</span>
              </div>
            )}
          </Button>
      </div>
    </Card>
  );
}
