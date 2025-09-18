
import { GroupChat } from "./GroupChat";
import { ChatDialog } from "./ChatDialog";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Friend } from "@/hooks/use-friends";
import { Message } from "@/hooks/use-private-messages";
import { GroupMessage } from "@/hooks/use-group-messages";

interface ChatContainerProps {
  showChat: boolean;
  showGroupChat: boolean;
  selectedFriend: Friend | null;
  currentUserId: string | null;
  messages: Message[];
  groupMessages: GroupMessage[];
  newMessage: string;
  isTyping: boolean;
  onBack: () => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onDeleteMessage: (messageId: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  onSendGroupMessage: (content: string, type: 'text' | 'audio' | 'image', mediaBlob?: Blob) => Promise<void>;
}

export const ChatContainer = ({
  showChat,
  showGroupChat,
  selectedFriend,
  currentUserId,
  messages,
  groupMessages,
  newMessage,
  isTyping,
  onBack,
  onMessageChange,
  onSendMessage,
  onDeleteMessage,
  onImageUpload,
  onSendGroupMessage
}: ChatContainerProps) => {
  if (!showChat) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-muted-foreground bg-muted/20">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <svg className="w-16 h-16 text-muted-foreground/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
          <p className="text-sm text-muted-foreground">Elige una conversación del menú para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  if (showGroupChat) {
    return (
      <GroupChat
        messages={groupMessages}
        currentUserId={currentUserId || ""}
        onSendMessage={onSendGroupMessage}
        onClose={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <ChatHeader friend={selectedFriend} onBack={onBack} />
      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onDeleteMessage={onDeleteMessage}
        />
      </div>
      <div className="border-t bg-background">
        <MessageInput
          newMessage={newMessage}
          isTyping={isTyping}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
          onImageUpload={onImageUpload}
        />
      </div>
    </div>
  );
};
