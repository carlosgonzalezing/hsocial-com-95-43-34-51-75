
import { useEffect, useRef, useState } from "react";
import { Message } from "@/hooks/use-private-messages";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageList({ messages, currentUserId, onDeleteMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages.length) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <p>No hay mensajes aún</p>
          <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 px-3 bg-muted/20">
      <div className="py-4 space-y-2">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const formattedDate = formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: es
          });

          return (
            <MessageItem 
              key={message.id}
              message={message} 
              isCurrentUser={isCurrentUser} 
              formattedDate={formattedDate} 
              onDeleteMessage={onDeleteMessage} 
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

// Extract message item to a separate component to manage copy functionality
function MessageItem({ 
  message, 
  isCurrentUser, 
  formattedDate, 
  onDeleteMessage 
}: { 
  message: Message, 
  isCurrentUser: boolean, 
  formattedDate: string,
  onDeleteMessage?: (messageId: string) => void
}) {
  const [isCopying, setIsCopying] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const handleLongPressStart = () => {
    // Check if message contains "Este mensaje ha sido eliminado"
    const isDeleted = message.content === "Este mensaje ha sido eliminado" || 
                      message.content === "Este mensaje ha sido eliminado automáticamente" ||
                      message.is_deleted;
                      
    if (isDeleted) return;
    
    // Start a timer for long press
    longPressTimer.current = window.setTimeout(() => {
      setIsCopying(true);
      copyMessageText();
    }, 800); // 800ms for long press
  };

  const handleLongPressEnd = () => {
    // Clear the timer if touch ends
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsCopying(false);
  };

  const copyMessageText = () => {
    const isDeleted = message.content === "Este mensaje ha sido eliminado" || 
                      message.content === "Este mensaje ha sido eliminado automáticamente" ||
                      message.is_deleted;
                      
    if (isDeleted) return;
    
    // Create a temporary indicator
    const indicator = document.createElement('div');
    indicator.className = 'copying-indicator active';
    indicator.textContent = 'Mensaje copiado';
    document.body.appendChild(indicator);
    
    // Copy to clipboard
    try {
      navigator.clipboard.writeText(message.content).then(() => {
        console.log('Copied to clipboard');
        
        // Remove the indicator after a delay
        setTimeout(() => {
          indicator.classList.remove('active');
          setTimeout(() => {
            document.body.removeChild(indicator);
          }, 200);
        }, 1500);
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isDeleted = message.content === "Este mensaje ha sido eliminado" || 
                    message.content === "Este mensaje ha sido eliminado automáticamente" ||
                    message.is_deleted;

  return (
    <div className={cn(
      "flex w-full mb-3",
      isCurrentUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[75%] relative group",
        isCurrentUser ? "order-1" : "order-2"
      )}>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm relative",
            isDeleted
              ? "bg-muted/50 text-muted-foreground italic"
              : isCurrentUser
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
          )}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onTouchCancel={handleLongPressEnd}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
        >
          <div className={`comment-text-selectable ${isCopying ? 'pulse-on-hold' : ''}`}>
            {message.content}
          </div>
          {/* Timestamp inside bubble */}
          <div className={cn(
            "text-xs mt-1 flex items-center gap-1",
            isCurrentUser ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
          )}>
            <span>{formattedDate}</span>
            {isCurrentUser && !isDeleted && (
              <div className="flex">
                <div className="w-3 h-3 text-primary-foreground/70">
                  <svg viewBox="0 0 16 15" fill="currentColor">
                    <path d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51z"/>
                    <path d="m5.849 9.329 6.929-8.723a.381.381 0 0 0-.062-.523l-.478-.372a.382.382 0 0 0-.53.062L4.566 7.881a.32.32 0 0 1-.484.033L3.566 7.6a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l.305-.383z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Opción para eliminar mensaje (solo para mensajes propios no eliminados) */}
        {isCurrentUser && !isDeleted && onDeleteMessage && (
          <DropdownMenu>
            <DropdownMenuTrigger className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4 text-primary-foreground hover:text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDeleteMessage(message.id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Eliminar mensaje
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
