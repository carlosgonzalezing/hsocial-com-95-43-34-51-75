
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/supabase-type-helpers";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  amount: number;
  created_at: string;
  payment_status: string;
  reference_code: string;
  currency?: string;
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await db.select("nequi_payments", "*")
        .eq("user_id" as any, user.id)
        .order("created_at", { ascending: false });

      const paymentsData = db.getArray(data, []);
      const formattedPayments: Payment[] = paymentsData.map((payment: any) => ({
        id: db.getProp(payment, 'id', ''),
        amount: Number(db.getProp(payment, 'amount', 0)),
        created_at: db.getProp(payment, 'created_at', ''),
        payment_status: db.getProp(payment, 'payment_status', 'pending'),
        reference_code: db.getProp(payment, 'reference_code', ''),
        currency: db.getProp(payment, 'currency', 'COP')
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error("Error loading payment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive"
    };
    
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === 'completed' ? 'Completado' : 
         status === 'pending' ? 'Pendiente' : 'Fallido'}
      </Badge>
    );
  };

  if (isLoading) {
    return <div>Cargando historial...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pagos</CardTitle>
        <CardDescription>
          Revisa todos tus pagos realizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">No tienes pagos registrados</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">
                    ${payment.amount.toLocaleString()} {payment.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ref: {payment.reference_code}
                  </p>
                </div>
                {getStatusBadge(payment.payment_status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
