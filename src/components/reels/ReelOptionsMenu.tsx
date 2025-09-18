import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpRight, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ReelOptionsMenuProps {
  postId: string;
  onHidePost: (postId: string) => void;
  triggerClassName?: string;
}

export function ReelOptionsMenu({ postId, onHidePost, triggerClassName }: ReelOptionsMenuProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const [interestLevel, setInterestLevel] = useState("high");
  
  const [shareContent, setShareContent] = useState("");

  const handleReportPost = async () => {
    toast({
      title: "Reporte enviado",
      description: "Gracias por ayudarnos a mantener la comunidad segura.",
    });
  };

  const handleHidePost = () => {
    onHidePost(postId);
    toast({
      title: "Publicación oculta",
      description: "Esta publicación ya no aparecerá en tu feed.",
    });
  };

  const saveInterest = async (userId: string, postId: string, interest: string) => {
    const { error } = await (supabase as any)
      .from('post_interests')
      .insert({ user_id: userId, post_id: postId, interest_level: interest } as any);
    if (error) throw error;
  };

  const handleSaveInterest = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para guardar tu interés.",
      });
      return;
    }

    try {
      await saveInterest(userId, postId, interestLevel);
      toast({
        title: "Interés guardado",
        description: "Hemos guardado tu nivel de interés en esta publicación.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No pudimos guardar tu interés.",
      });
    }
  };

  const sharePost = async (userId: string, sharedPostId: string, content: string) => {
    const { error } = await (supabase as any)
      .from('posts')
      .insert({ user_id: userId, content, post_type: 'share', shared_post_id: sharedPostId } as any);
    if (error) throw error;
  };

  const handleSharePost = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para compartir esta publicación.",
      });
      return;
    }

    try {
      await sharePost(userId, postId, shareContent);
      toast({
        title: "Publicación compartida",
        description: "Has compartido esta publicación en tu perfil.",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No pudimos compartir esta publicación.",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("h-8 w-8 p-0", triggerClassName)}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => window.open(`https://hsocial.vercel.app/post/${postId}`, '_blank')}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Ver publicación
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Mira esta publicación en HSocial!',
                url: `https://hsocial.vercel.app/post/${postId}`
              }).then(() => {
                toast({
                  title: "Publicación compartida",
                  description: "Gracias por compartir!",
                });
              }).catch((error) => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "No pudimos compartir esta publicación.",
                });
                console.error('Error sharing:', error);
              });
            } else {
              navigator.clipboard.writeText(`https://hsocial.vercel.app/post/${postId}`).then(() => {
                toast({
                  title: "Enlace copiado",
                  description: "Enlace a la publicación copiado al portapapeles.",
                });
              }).catch(err => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "No pudimos copiar el enlace.",
                });
                console.error('Error copying text: ', err);
              });
            }
          }}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Compartir
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Sheet>
            <SheetTrigger asChild>
              <DropdownMenuItem>Guardar interés</DropdownMenuItem>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Guardar interés</SheetTitle>
                <SheetDescription>
                  Selecciona el nivel de interés que tienes en esta publicación.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="interest" className="text-right">
                    Nivel de interés
                  </Label>
                  <select
                    id="interest"
                    className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={interestLevel}
                    onChange={(e) => setInterestLevel(e.target.value)}
                  >
                    <option value="high">Alto</option>
                    <option value="medium">Medio</option>
                    <option value="low">Bajo</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveInterest}>Guardar</Button>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <DropdownMenuItem>Compartir publicación</DropdownMenuItem>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Compartir publicación</SheetTitle>
                <SheetDescription>
                  Escribe un comentario para compartir esta publicación en tu perfil.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shareContent" className="text-right">
                    Comentario
                  </Label>
                  <Textarea
                    id="shareContent"
                    className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={shareContent}
                    onChange={(e) => setShareContent(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSharePost}>Compartir</Button>
            </SheetContent>
          </Sheet>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem>
                Ocultar publicación
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción ocultará la publicación de tu feed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleHidePost}>Ocultar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem>
                Reportar publicación
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción reportará la publicación a los administradores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReportPost}>Reportar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

    </>
  );
}
