import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Check, Star, Heart, Eye, Zap, Copy, AlertCircle } from "lucide-react";
import { usePremiumSubscription } from "@/hooks/use-premium-subscription";
import { PremiumBadge } from "@/components/premium/PremiumBadge";

export default function Premium() {
  const { isPremium, isLoading, subscription, createNequiPayment } = usePremiumSubscription();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{reference: string, amount: number} | null>(null);

  const handleStartPayment = async () => {
    const payment = await createNequiPayment("3001234567"); // Placeholder phone
    if (payment) {
      setPaymentData({
        reference: payment.reference_code,
        amount: payment.amount
      });
      setShowPayment(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Ve quién visita tu perfil",
      description: "Descubre quién está interesado en ti con estadísticas detalladas"
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "20 corazones diarios",
      description: "Envía hasta 20 corazones por día en lugar de solo 1"
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Badge premium dorado",
      description: "Destaca con tu insignia premium en toda la plataforma"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Funciones exclusivas",
      description: "Acceso prioritario a nuevas características"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Modo incógnito premium",
      description: "Navega de forma anónima cuando lo desees"
    }
  ];

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                ¡Eres Premium!
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Disfruta de todos los beneficios exclusivos
            </p>
            <PremiumBadge className="mt-4" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Crown className="h-5 w-5" />
                  Estado de Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      {subscription?.plan_type || 'Premium'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      {subscription?.status || 'Activo'}
                    </Badge>
                  </div>
                  {subscription?.end_date && (
                    <div className="flex justify-between">
                      <span>Válido hasta:</span>
                      <span className="font-medium">
                        {new Date(subscription.end_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Corazones Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">20</div>
                  <p className="text-sm text-muted-foreground">
                    Corazones disponibles por día
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Características Premium Activas</CardTitle>
              <CardDescription>
                Estas son todas las funciones premium que tienes disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hazte Premium
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Desbloquea funciones exclusivas y destaca en la plataforma
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl font-bold">$10,000</span>
            <span className="text-lg text-muted-foreground">COP/mes</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Crown className="h-6 w-6" />
                Funciones Premium
              </CardTitle>
              <CardDescription>
                Todo lo que obtienes con tu suscripción premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-full text-purple-600 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800">{feature.title}</h3>
                      <p className="text-sm text-purple-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comenzar Suscripción</CardTitle>
              <CardDescription>
                Activa tu suscripción premium ahora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartPayment}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                <Crown className="h-5 w-5 mr-2" />
                Suscribirse por $10,000 COP
              </Button>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Pago único mensual • Cancela cuando quieras
              </p>
            </CardContent>
          </Card>
        </div>

        {showPayment && paymentData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Instrucciones de Pago</CardTitle>
              <CardDescription>
                Sigue estos pasos para completar tu pago en Nequi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-medium">Código de referencia:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded">{paymentData.reference}</code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(paymentData.reference)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Monto:</span>
                  <div className="text-2xl font-bold text-green-600">
                    ${paymentData.amount.toLocaleString()} COP
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Una vez realices el pago en Nequi, regresa aquí para reportarlo y activar tu suscripción premium.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => setShowPayment(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}