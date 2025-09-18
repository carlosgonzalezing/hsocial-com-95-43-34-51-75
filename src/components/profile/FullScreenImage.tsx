
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Download, ZoomIn, ZoomOut, RotateCw, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FullScreenImageProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export function FullScreenImage({ isOpen, onClose, imageUrl, altText = "Imagen" }: FullScreenImageProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `img_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: altText,
          url: imageUrl,
        });
        toast({
          title: "Compartido",
          description: "La imagen ha sido compartida exitosamente",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(imageUrl);
      toast({
        title: "URL Copiada",
        description: "La URL de la imagen ha sido copiada al portapapeles",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm border-none sm:rounded-lg">
        <div className="p-2 flex items-center justify-between bg-black/10 dark:bg-white/5">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRotate}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
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
          <img 
            src={imageUrl} 
            alt={altText}
            className="max-h-[85vh] object-contain transition-all duration-200"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: "pointer"
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
