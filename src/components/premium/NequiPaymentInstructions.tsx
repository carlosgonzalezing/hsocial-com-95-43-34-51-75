import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Copy, CheckCircle, Percent, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PromoCodeInput } from "./PromoCodeInput";

interface PaymentData {
  reference: string;
  amount: number;
}

export function NequiPaymentInstructions({ reference, amount }: PaymentData) {
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const navigate = useNavigate();
  
  const originalAmount = amount;
  const finalAmount = Math.max(1000, originalAmount - discountAmount); // Mínimo 1000 COP

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Información copiada al portapapeles"
    });
  };

  const reportPayment = async () => {
    setIsReporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const phoneNumber = "3014343180"; // Número por defecto para reportar

      const { error } = await supabase
        .from('nequi_payments')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          amount: finalAmount,
          reference_code: reference
        });

      if (error) throw error;

      setIsReported(true);
      toast({
        title: "Pago reportado",
        description: "Tu pago ha sido reportado y será verificado pronto"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reportar el pago",
        variant: "destructive"
      });
    } finally {
      setIsReporting(false);
    }
  };

  if (isReported) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-green-700">¡Pago Reportado!</CardTitle>
          <CardDescription>
            Tu pago ha sido reportado exitosamente y será verificado por nuestro equipo.
            Te notificaremos cuando sea confirmado y tu suscripción Premium se active.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => navigate("/premium")} variant="outline">
            Volver a Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Código Promocional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-orange-600" />
            ¿Tienes un código promocional?
          </CardTitle>
          <CardDescription>
            Aplica tu código antes de realizar el pago para obtener descuentos especiales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromoCodeInput
            originalAmount={originalAmount}
            onPromoApplied={(discount, code) => {
              setDiscountAmount(discount);
              setAppliedPromoCode(code);
            }}
            onPromoRemoved={() => {
              setDiscountAmount(0);
              setAppliedPromoCode("");
            }}
          />
        </CardContent>
      </Card>

      {/* Instrucciones de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            Pago con Nequi
          </CardTitle>
          <CardDescription>
            Sigue estos pasos para completar tu pago y activar tu suscripción Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Resumen de Pago */}
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                Resumen de Pago
              </h3>
              <div className="space-y-3">
                {/* Mostrar descuento si aplica */}
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span>Precio original:</span>
                      <span className="line-through text-muted-foreground">
                        ${originalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                      <span>Descuento ({appliedPromoCode}):</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                    <Separator />
                  </>
                )}
                
                <div className="flex justify-between items-center">
                  <span>Número Nequi:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">3014343180</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("3014343180")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Valor a pagar:</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-base ${discountAmount > 0 ? 'bg-green-50 text-green-800 border-green-300' : ''}`}
                    >
                      ${finalAmount.toLocaleString()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(finalAmount.toString())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Código de referencia:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{reference}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(reference)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pasos a seguir */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Pasos a seguir:</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <p className="font-medium">Abre tu app Nequi</p>
                    <p className="text-sm text-muted-foreground">Ve a la opción "Enviar dinero"</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <p className="font-medium">Ingresa el número de destino</p>
                    <p className="text-sm text-muted-foreground">Número: <span className="font-mono">3014343180</span></p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <p className="font-medium">Ingresa el monto</p>
                    <p className="text-sm text-muted-foreground">${finalAmount.toLocaleString()} COP</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</div>
                  <div>
                    <p className="font-medium">Agrega el código de referencia</p>
                    <p className="text-sm text-muted-foreground">En el mensaje/concepto: <span className="font-mono">{reference}</span></p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">5</div>
                  <div>
                    <p className="font-medium">Confirma el envío</p>
                    <p className="text-sm text-muted-foreground">Revisa los datos y envía el dinero</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">6</div>
                  <div>
                    <p className="font-medium">Reporta tu pago</p>
                    <p className="text-sm text-muted-foreground">Haz clic en el botón de abajo cuando hayas completado el pago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón para reportar pago */}
            <Button 
              onClick={reportPayment}
              disabled={isReporting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isReporting ? "Reportando..." : "Ya completé el pago"}
            </Button>

            {/* Nota importante */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> El código de referencia es obligatorio para identificar tu pago. 
                Asegúrate de incluirlo en el mensaje o concepto del envío.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}