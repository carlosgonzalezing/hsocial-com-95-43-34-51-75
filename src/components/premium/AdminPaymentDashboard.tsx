import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, X, DollarSign, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Payment {
  id: string;
  user_id: string;
  phone_number: string;
  amount: number;
  reference_code: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
  } | null;
}

export function AdminPaymentDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    total_reported: 0,
    total_confirmed: 0,
    pending_verification: 0,
    total_revenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
    loadMetrics();
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('nequi_payments')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPayments(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('nequi_payments')
        .select('payment_status, amount');

      if (error) throw error;

      const reported = data?.filter(p => p.payment_status === 'reported').length || 0;
      const confirmed = data?.filter(p => p.payment_status === 'confirmed').length || 0;
      const pending = data?.filter(p => p.payment_status === 'pending').length || 0;
      const revenue = data?.filter(p => p.payment_status === 'confirmed')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setMetrics({
        total_reported: reported,
        total_confirmed: confirmed,
        pending_verification: reported,
        total_revenue: revenue
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'confirm' | 'reject') => {
    setProcessing(paymentId);
    
    try {
      const functionName = action === 'confirm' ? 'confirm_payment_and_activate_subscription' : 'reject_payment';
      
      const { data, error } = await supabase.rpc(functionName, {
        payment_id_param: paymentId,
        ...(action === 'reject' && { rejection_reason: 'Pago no verificado por administrador' })
      });

      if (error) throw error;

      const result = data as any;

      if (result?.success) {
        toast({
          title: action === 'confirm' ? "Pago confirmado" : "Pago rechazado",
          description: result.message,
        });
        
        await loadPayments();
        await loadMetrics();
      } else {
        throw new Error(result?.error || 'Error procesando pago');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `No se pudo ${action === 'confirm' ? 'confirmar' : 'rechazar'} el pago`,
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'reported':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Verificando</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Verificar</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending_verification}</div>
            <p className="text-xs text-muted-foreground">Pagos reportados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_confirmed}</div>
            <p className="text-xs text-muted-foreground">Pagos procesados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.total_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">COP confirmados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_reported > 0 ? 
                Math.round((metrics.total_confirmed / (metrics.total_confirmed + metrics.total_reported)) * 100) : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Tasa de confirmación</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {metrics.pending_verification > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tienes {metrics.pending_verification} pagos esperando verificación.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes</CardTitle>
          <CardDescription>
            Gestiona y verifica los pagos de suscripción Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                  <div className="font-medium">
                    @{payment.profiles?.username || 'Usuario desconocido'}
                  </div>
                    {getStatusBadge(payment.payment_status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Monto:</span> ${payment.amount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span> {payment.phone_number}
                    </div>
                    <div>
                      <span className="font-medium">Ref:</span> {payment.reference_code}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {payment.payment_status === 'reported' && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handlePaymentAction(payment.id, 'confirm')}
                      disabled={processing === payment.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handlePaymentAction(payment.id, 'reject')}
                      disabled={processing === payment.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                )}

                {processing === payment.id && (
                  <div className="ml-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            ))}

            {payments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay pagos registrados aún
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}