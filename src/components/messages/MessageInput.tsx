
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Mic, Image, AtSign } from "lucide-react";
import { useRef, useState } from "react";
import { useMentions } from "@/hooks/mentions";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface MessageInputProps {
  newMessage: string;
  isTyping?: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onImageUpload?: (file: File) => Promise<void>;
}

export const MessageInput = ({ 
  newMessage, 
  isTyping,
  onMessageChange, 
  onSendMessage,
  onImageUpload 
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const {
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextChange,
    insertMention,
    setMentionListVisible
  } = useMentions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMessageChange(value);
    
    if (inputRef.current) {
      handleTextChange(value, inputRef.current.selectionStart, inputRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle mention selection with keyboard navigation
    if (mentionListVisible && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev <= 0 ? mentionUsers.length - 1 : prev - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionIndex >= 0 && mentionIndex < mentionUsers.length) {
          const newText = insertMention(newMessage, mentionUsers[mentionIndex]);
          onMessageChange(newText);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionListVisible(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSelectMention = (user: any) => {
    const newText = insertMention(newMessage, user);
    onMessageChange(newText);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleMentionClick = () => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart;
      const textBefore = newMessage.substring(0, cursorPos);
      const textAfter = newMessage.substring(cursorPos);
      
      // Insert @ at cursor position
      const newValue = textBefore + '@' + textAfter;
      onMessageChange(newValue);
      
      // Focus the input and move cursor after @
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
    }
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart || newMessage.length;
      const textBefore = newMessage.substring(0, cursorPos);
      const textAfter = newMessage.substring(cursorPos);
      
      const newValue = textBefore + emoji + textAfter;
      onMessageChange(newValue);
      
      // Focus the input and move cursor after emoji
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        id="message-image-upload"
        name="message-image-upload"
        className="hidden"
      />
      
      <div className="flex items-center gap-2 p-2 bg-background border-t border-border">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted/70 text-muted-foreground shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted/70 text-muted-foreground shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted/70 text-muted-foreground shrink-0"
            onClick={handleMentionClick}
            title="Mencionar"
          >
            <AtSign className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-full bg-muted/50 border-muted-foreground/20 pl-4 pr-12 py-2 text-sm placeholder:text-muted-foreground focus:bg-background transition-colors"
            />
            
            {newMessage.trim() ? (
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-primary hover:bg-primary/90 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted text-muted-foreground shrink-0"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <MentionSuggestions
        users={mentionUsers}
        isVisible={mentionListVisible}
        position={mentionPosition}
        selectedIndex={mentionIndex}
        onSelectUser={handleSelectMention}
        onSetIndex={setMentionIndex}
      />

      {showEmojiPicker && (
        <div className="absolute bottom-full left-2 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}
    </div>
  );
};
