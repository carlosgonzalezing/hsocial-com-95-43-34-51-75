import { Settings, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessagesHeaderProps {
  onNewChat?: () => void;
  onSettings?: () => void;
}

export const MessagesHeader = ({ onNewChat, onSettings }: MessagesHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <h1 className="text-xl font-semibold text-foreground">Chats</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={onNewChat}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={onSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};