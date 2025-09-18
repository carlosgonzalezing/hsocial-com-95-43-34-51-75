
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, MessageCircle, DollarSign, User } from "lucide-react";
import { Marketplace } from "@/types/post";

interface MarketplaceDisplayProps {
  marketplace: Marketplace;
  postId: string;
  sellerUsername?: string;
  isOwnPost?: boolean;
}

export function MarketplaceDisplay({ 
  marketplace, 
  postId, 
  sellerUsername,
  isOwnPost = false 
}: MarketplaceDisplayProps) {
  const [showContactDialog, setShowContactDialog] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                📚 Apuntes en venta
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-gray-900">{marketplace.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{marketplace.subject}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600 font-bold">
              <DollarSign className="h-4 w-4" />
              {formatPrice(marketplace.price)}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700">{marketplace.description}</p>

        {/* Document preview placeholder */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Vista previa del documento</span>
          </div>
          <div className="bg-gray-100 h-32 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">Vista previa disponible solo para compradores interesados</p>
            </div>
          </div>
        </div>

        {!isOwnPost && (
          <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar vendedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contactar vendedor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Vendedor: @{sellerUsername || 'Usuario'}</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">¿Cómo funciona?</h4>
                  <ol className="text-sm space-y-1 text-gray-700">
                    <li>1. Envía un mensaje directo al vendedor</li>
                    <li>2. Coordinan un lugar de encuentro en la universidad</li>
                    <li>3. Revisan los apuntes en persona</li>
                    <li>4. Realizan el pago y entrega física</li>
                  </ol>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    // Aquí se implementaría la lógica para enviar mensaje
                    alert('Función de mensajería próximamente disponible');
                    setShowContactDialog(false);
                  }}
                >
                  Enviar mensaje directo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {isOwnPost && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Tus apuntes están publicados. Los interesados te contactarán directamente.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
