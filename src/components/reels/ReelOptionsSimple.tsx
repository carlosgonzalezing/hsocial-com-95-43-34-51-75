
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReelOptionsSimpleProps {
  postId: string;
  triggerClassName?: string;
}

export function ReelOptionsSimple({ postId, triggerClassName }: ReelOptionsSimpleProps) {
  const { toast } = useToast();

  const handleInterest = async (level: 'high' | 'low') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Debes iniciar sesión');
      const { error } = await (supabase as any)
        .from('post_interests')
        .insert({ user_id: user.id, post_id: postId, interest_level: level } as any);
      if (error) throw error;
      toast({ title: level === 'high' ? '¡Me interesa!' : 'No me interesa', description: 'Preferencia guardada' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'No se pudo guardar tu preferencia' });
    }
  };

  const handleReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Debes iniciar sesión');
      const { error } = await (supabase as any)
        .from('post_reports')
        .insert({ user_id: user.id, post_id: postId, reason: 'video' } as any);
      if (error && (error as any).code !== '23505') throw error; // ignore unique violation if already reported
      toast({ title: 'Reporte enviado', description: 'Gracias por reportar este video' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'No se pudo enviar el reporte' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={"h-12 w-12 rounded-full text-white hover:bg-white/20 " + (triggerClassName || "")}
        >
          <MoreVertical className="h-7 w-7" />
          <span className="sr-only">Opciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onSelect={() => handleInterest('high')}>Me interesa</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleInterest('low')}>No me interesa</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleReport}>Reportar video</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
