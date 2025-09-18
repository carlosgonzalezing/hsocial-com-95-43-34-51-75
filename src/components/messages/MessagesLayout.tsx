
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FullScreenChatLayout } from "./FullScreenChatLayout";

interface MessagesLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  showSidebar: boolean;
  isFullScreenChat?: boolean;
}

export const MessagesLayout = ({ sidebar, content, showSidebar, isFullScreenChat = false }: MessagesLayoutProps) => {
  const isMobile = useIsMobile();

  // Full-screen chat mode (when a chat is selected)
  if (isFullScreenChat) {
    return (
      <FullScreenChatLayout>
        {content}
      </FullScreenChatLayout>
    );
  }

  // For mobile, handle sidebar visibility differently
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Sidebar - Full width on mobile when shown */}
        {showSidebar && (
          <Card className="w-full h-full rounded-none bg-card border-r border-border">
            <div className="h-full overflow-hidden">
              {sidebar}
            </div>
          </Card>
        )}
        
        {/* Content area - Hidden on mobile when sidebar is shown */}
        <div className={`
          flex-1 flex flex-col overflow-hidden
          ${showSidebar ? 'hidden' : 'flex'}
        `}>
          {content}
        </div>
      </div>
    );
  }

  // Desktop layout - Full screen for messages
  return (
    <div className="h-screen bg-background">
      <div className="h-full flex max-w-none mx-auto">
        {/* Sidebar - Fixed width on desktop */}
        {showSidebar && (
          <Card className="w-[350px] min-w-[350px] rounded-none bg-card border-r border-border">
            <div className="h-full overflow-hidden">
              {sidebar}
            </div>
          </Card>
        )}
        
        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {content}
        </div>
      </div>
    </div>
  );
};
