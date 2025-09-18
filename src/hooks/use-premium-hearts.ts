import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePremiumSubscription } from "./use-premium-subscription";

interface PremiumHearts {
  hearts_given_today: number;
  hearts_limit: number;
  last_reset_date: string;
}

export function usePremiumHearts() {
  const [hearts, setHearts] = useState<PremiumHearts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isPremium } = usePremiumSubscription();
  const { toast } = useToast();

  useEffect(() => {
    if (isPremium) {
      fetchHearts();
    } else {
      setHearts(null);
      setIsLoading(false);
    }
  }, [isPremium]);

  const fetchHearts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('premium_hearts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHearts(data);
      } else {
        // Crear registro inicial si no existe
        await initializeHearts();
      }
    } catch (error) {
      console.error('Error fetching hearts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeHearts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('premium_hearts')
        .insert({
          user_id: user.id,
          hearts_given_today: 0,
          hearts_limit: isPremium ? 20 : 1,
          last_reset_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      setHearts(data);
    } catch (error) {
      console.error('Error initializing hearts:', error);
    }
  };

  const giveHeart = async (profileId: string) => {
    if (!hearts || !isPremium) {
      toast({
        variant: "destructive",
        title: "Premium requerido",
        description: "Necesitas una suscripción premium para dar corazones"
      });
      return false;
    }

    if (hearts.hearts_given_today >= hearts.hearts_limit) {
      toast({
        variant: "destructive",
        title: "Límite alcanzado",
        description: `Ya has dado ${hearts.hearts_limit} corazones hoy`
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Verificar si ya dio corazón a este perfil
      const { data: existingHeart } = await supabase
        .from('profile_hearts')
        .select('id')
        .eq('giver_id', user.id)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (existingHeart) {
        toast({
          variant: "destructive",
          title: "Ya diste corazón",
          description: "Ya le diste un corazón a este perfil"
        });
        return false;
      }

      // Dar el corazón
      const { error: heartError } = await supabase
        .from('profile_hearts')
        .insert({
          giver_id: user.id,
          profile_id: profileId
        });

      if (heartError) throw heartError;

      // Actualizar contador
      const { error: updateError } = await supabase
        .from('premium_hearts')
        .update({
          hearts_given_today: hearts.hearts_given_today + 1
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Actualizar estado local
      setHearts(prev => prev ? {
        ...prev,
        hearts_given_today: prev.hearts_given_today + 1
      } : null);

      toast({
        title: "❤️ Corazón enviado",
        description: `Corazones restantes: ${hearts.hearts_limit - hearts.hearts_given_today - 1}`
      });

      return true;
    } catch (error) {
      console.error('Error giving heart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el corazón"
      });
      return false;
    }
  };

  const remainingHearts = hearts ? hearts.hearts_limit - hearts.hearts_given_today : 0;
  const canGiveHearts = isPremium && remainingHearts > 0;

  return {
    hearts,
    isLoading,
    remainingHearts,
    canGiveHearts,
    giveHeart,
    fetchHearts
  };
}