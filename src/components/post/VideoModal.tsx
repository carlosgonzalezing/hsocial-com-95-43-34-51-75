import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Download, Share2, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  altText?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, altText = "Video" }: VideoModalProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `video_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: altText,
          url: videoUrl,
        });
        toast({
          title: "Compartido",
          description: "El video ha sido compartido exitosamente",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(videoUrl);
      toast({
        title: "URL Copiada",
        description: "La URL del video ha sido copiada al portapapeles",
      });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm border-none sm:rounded-lg [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Vista de video: {altText}</DialogTitle>
        <div className="p-2 flex items-center justify-between bg-black/10 dark:bg-white/5">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Compartir video"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Descargar video"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div 
          className="flex-1 flex items-center justify-center overflow-auto bg-black/80 dark:bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <video 
            ref={videoRef}
            src={videoUrl} 
            controls
            muted={isMuted}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}