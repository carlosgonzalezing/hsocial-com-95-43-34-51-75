
import { useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useMessageNotifications } from "@/components/messages/MessageNotification";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import { SidebarContent } from "@/components/messages/SidebarContent";
import { ChatContainer } from "@/components/messages/ChatContainer";
import { ChatDialog } from "@/components/messages/ChatDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { sendGroupMessage } from "@/hooks/use-group-messages";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export const MessagesController = () => {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [dialogTargetUser, setDialogTargetUser] = useState<{
    id: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Set up message notifications
  useMessageNotifications(user?.id || null);

  // Use the messages hook for state management
  const {
    selectedFriend,
    setSelectedFriend,
    newMessage,
    showGroupChat,
    setShowGroupChat,
    searchQuery,
    setSearchQuery,
    isTyping,
    messages,
    groupMessages,
    filteredFriends,
    archivedFriends,
    handleChatLongPress,
    handleChatPressEnd,
    handleUnarchiveChat,
    handleMessageChange,
    handleSendMessage,
    handleDeleteMessage,
    handleImageUpload,
    handleBack
  } = useMessages(user?.id || null);

  // Handle sending group messages
  const handleSendGroupMessage = async (content: string, type: 'text' | 'audio' | 'image' = 'text', mediaBlob?: Blob) => {
    if (!isAuthenticated || !user?.id) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para enviar mensajes",
      });
      return;
    }

    try {
      // Use Red H group as default
      await sendGroupMessage(user.id, content, "red-h", type, mediaBlob);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje al grupo",
      });
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Comprobando sesión...</span>
      </div>
    );
  }

  // Determine sidebar visibility based on screen size and selection state
  const showSidebar = (!Boolean(selectedFriend) && !showGroupChat) || !isMobile;
  const showChat = Boolean(selectedFriend) || showGroupChat;
  const isFullScreenChat = showChat && !showSidebar;

  return (
    <MessagesLayout
      showSidebar={showSidebar}
      isFullScreenChat={isFullScreenChat}
      sidebar={
        <SidebarContent
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onGroupChatClick={() => {
            setShowGroupChat(true);
            setSelectedFriend(null);
          }}
          filteredFriends={filteredFriends}
          selectedFriend={selectedFriend}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setShowGroupChat(false);
          }}
          onLongPress={handleChatLongPress}
          onPressEnd={handleChatPressEnd}
          archivedFriends={archivedFriends}
          onUnarchive={handleUnarchiveChat}
        />
      }
      content={
        <ChatContainer
            showChat={showChat}
            showGroupChat={showGroupChat}
            selectedFriend={selectedFriend}
            currentUserId={user?.id || null}
            messages={messages}
            groupMessages={groupMessages}
            newMessage={newMessage}
            isTyping={isTyping}
            onBack={handleBack}
            onMessageChange={handleMessageChange}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onImageUpload={handleImageUpload}
            onSendGroupMessage={handleSendGroupMessage}
          />
      }
    />
  );
};
