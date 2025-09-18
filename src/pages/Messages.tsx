
import { MessagesController } from "@/components/messages/MessagesController";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Messages = () => {
  return (
    <div className="fixed inset-0 bg-background">
      {/* Header with back button */}
      <div className="h-14 bg-card/80 backdrop-blur-sm border-b border-border flex items-center px-4 z-10">
        <Link 
          to="/" 
          className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Inicio</span>
        </Link>
      </div>
      
      {/* Messages content */}
      <div className="h-[calc(100%-3.5rem)]">
        <MessagesController />
      </div>
    </div>
  );
};

export default Messages;
