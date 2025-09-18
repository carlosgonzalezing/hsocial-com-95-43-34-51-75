
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, Eye, ShoppingBag, Zap, Ban, History, CreditCard } from "lucide-react";
import { usePremiumSubscription } from "@/hooks/use-premium-subscription";
import { NequiPaymentInstructions } from "./NequiPaymentInstructions";
import { PaymentHistory } from "./PaymentHistory";

export function PremiumSubscriptionCard() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const { isPremium, subscription, createNequiPayment, reportPayment } = usePremiumSubscription();

  const handleSubscribe = async () => {
    if (!phoneNumber.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      const payment = await createNequiPayment(phoneNumber);
      if (payment) {
        setCurrentPayment(payment);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (showHistory) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setShowHistory(false)}
          className="mb-4"
        >
          ← Volver
        </Button>
        <PaymentHistory />
      </div>
    );
  }

  if (currentPayment) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentPayment(null)}
          className="mb-4"
        >
          ← Volver
        </Button>
        <NequiPaymentInstructions 
          reference={currentPayment.reference_code} 
          amount={10000}
        />
      </div>
    );
  }

  const features = [
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      title: "20 Corazones Diarios",
      description: "Dale más corazones a tus amigos"
    },
    {
      icon: <Crown className="h-5 w-5 text-yellow-500" />,
      title: "Banner Dorado",
      description: "Destaca en popularidad y perfil"
    },
    {
      icon: <Ban className="h-5 w-5 text-green-500" />,
      title: "Sin Anuncios",
      description: "Experiencia completamente limpia"
    },
    {
      icon: <Eye className="h-5 w-5 text-purple-500" />,
      title: "Modo Incógnito",
      description: "Publica de forma anónima"
    },
    {
      icon: <Zap className="h-5 w-5 text-blue-500" />,
      title: "Mayor Alcance",
      description: "Prioridad en recomendaciones"
    },
    {
      icon: <ShoppingBag className="h-5 w-5 text-orange-500" />,
      title: "Marketplace Premium",
      description: "Acceso completo a documentos"
    }
  ];

  if (isPremium) {
    return (
      <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-600" />
            <CardTitle className="text-yellow-700 text-xl">✨ ¡YA ERES PREMIUM! ✨</CardTitle>
          </div>
          <CardDescription className="text-yellow-600 font-medium">
            🎉 Usuario Fino Elite 🎉<br/>
            Tu suscripción está activa hasta el {new Date(subscription?.end_date || '').toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                {feature.icon}
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-400">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <CardTitle>Suscripción Premium</CardTitle>
        </div>
        <CardDescription>
          Desbloquea todas las funcionalidades premium
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            $10,000 COP/mes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
              {feature.icon}
              <div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Pagar con Nequi</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistory(true)}
            >
              <History className="h-4 w-4 mr-1" />
              Historial
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Número de teléfono Nequi"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isProcessing}
            />
            <Button 
              onClick={handleSubscribe}
              disabled={isProcessing || !phoneNumber.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? "Procesando..." : "Iniciar Pago Nequi"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Te guiaremos paso a paso para completar tu pago
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
