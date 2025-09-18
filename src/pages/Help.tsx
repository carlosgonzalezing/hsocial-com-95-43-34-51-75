import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Send, Phone } from "lucide-react";

export default function Help() {
  const handleWhatsApp = () => {
    const phoneNumber = "573014343180";
    const message = encodeURIComponent("Hola, necesito ayuda con HSocial");
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <FullScreenPageLayout title="Ayuda y Soporte">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">¿Tienes algún problema o sugerencia?</h1>
          <p className="text-lg text-muted-foreground">
            Envíanos tu mensaje a nuestro equipo HSocial
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              Contacto Directo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ¿Necesitas ayuda inmediata? Contáctanos directamente por WhatsApp y 
              nuestro equipo te responderá lo más pronto posible.
            </p>
            
            <Button 
              onClick={handleWhatsApp}
              className="w-full gap-3 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Phone className="h-5 w-5" />
              Enviar mensaje por WhatsApp
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              +57 301 434 3180
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 text-center">
              <Send className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Respuesta Rápida</h3>
              <p className="text-sm text-muted-foreground">
                Respondemos en menos de 24 horas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Soporte Completo</h3>
              <p className="text-sm text-muted-foreground">
                Ayuda técnica y sugerencias
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Preguntas Frecuentes</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">¿Cómo puedo reportar un problema?</p>
                <p className="text-muted-foreground">Usa el botón de WhatsApp para contactarnos directamente.</p>
              </div>
              <div>
                <p className="font-medium">¿Cómo actualizo mi perfil?</p>
                <p className="text-muted-foreground">Ve a Configuración {">"} Cuenta para editar tu información.</p>
              </div>
              <div>
                <p className="font-medium">¿Dónde puedo hacer sugerencias?</p>
                <p className="text-muted-foreground">¡Nos encantan las sugerencias! Contáctanos por WhatsApp.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FullScreenPageLayout>
  );
}