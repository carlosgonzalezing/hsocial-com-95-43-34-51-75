
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  payment_method: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
}

export function usePremiumSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Force refresh premium status when hook is used
  const refreshPremiumStatus = async () => {
    await fetchSubscription();
  };

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log("🚀 Verificando estado premium con función optimizada...");

      // Usar función RPC optimizada para verificar premium
      const { data: isPremiumStatus, error } = await supabase.rpc('check_user_premium_status', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error checking premium status:', error);
        setIsLoading(false);
        return;
      }

      if (isPremiumStatus) {
        // Si es premium, obtener detalles de suscripción solo si es necesario
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
        setIsPremium(true);
        console.log("✅ Usuario premium verificado");
      } else {
        setSubscription(null);
        setIsPremium(false);
        console.log("✅ Usuario no premium verificado");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_user_premium_status', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error checking premium status:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const createNequiPayment = async (phoneNumber: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para suscribirte"
        });
        return;
      }

      // Generar código de referencia único
      const referenceCode = `PREM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Insertar pago pendiente
      const { data: payment, error } = await supabase
        .from('nequi_payments')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          amount: 10000, // $10,000 COP
          reference_code: referenceCode,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear el pago"
        });
        return;
      }

      toast({
        title: "Pago creado exitosamente",
        description: `Revisa las instrucciones para completar tu pago en Nequi`
      });

      return payment;
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar el pago"
      });
    }
  };

  const reportPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('nequi_payments')
        .update({ payment_status: 'reported' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Pago reportado",
        description: "Tu pago está siendo verificado. Te notificaremos cuando sea confirmado."
      });

      fetchSubscription();
    } catch (error) {
      console.error('Error reporting payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reportar el pago"
      });
    }
  };

  const confirmPayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { paymentId, action: 'confirm' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Suscripción activada",
          description: "¡Tu suscripción premium ha sido activada exitosamente!"
        });
        fetchSubscription();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo confirmar el pago"
      });
      return false;
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { paymentId, action: 'reject' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Pago rechazado",
          description: "El pago ha sido rechazado"
        });
        fetchSubscription();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo rechazar el pago"
      });
      return false;
    }
  };

  const getUserPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('nequi_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  };

  return {
    subscription,
    isPremium,
    isLoading,
    fetchSubscription,
    refreshPremiumStatus,
    checkPremiumStatus,
    createNequiPayment,
    reportPayment,
    confirmPayment,
    rejectPayment,
    getUserPayments
  };
}
