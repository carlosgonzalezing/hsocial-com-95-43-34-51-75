import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Percent, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  valid: boolean;
  code?: string;
  discount_percentage?: number;
  description?: string;
  error?: string;
  id?: string;
}

interface PromoCodeInputProps {
  onPromoApplied: (discount: number, code: string) => void;
  onPromoRemoved: () => void;
  originalAmount: number;
}

export function PromoCodeInput({ 
  onPromoApplied, 
  onPromoRemoved, 
  originalAmount 
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un código promocional",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        code_param: promoCode.trim()
      });

      if (error) throw error;

      const result = (data as any) || { valid: false, error: 'Error en la respuesta' };

      if (result.valid && result.discount_percentage) {
        setAppliedPromo(result);
        const discountAmount = (originalAmount * result.discount_percentage) / 100;
        onPromoApplied(discountAmount, result.code || promoCode);
        
        toast({
          title: "¡Código aplicado!",
          description: `${result.discount_percentage}% de descuento aplicado`,
        });
      } else {
        toast({
          title: "Código inválido",
          description: result.error || "El código promocional no es válido",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo validar el código promocional",
        variant: "destructive"
      });
      console.error("Error validating promo code:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
    onPromoRemoved();
    toast({
      title: "Código removido",
      description: "Se ha quitado el código promocional"
    });
  };

  if (appliedPromo?.valid) {
    return (
      <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Código aplicado: {appliedPromo.code}
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              -{appliedPromo.discount_percentage}%
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removePromoCode}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {appliedPromo.description && (
          <p className="text-sm text-green-700 dark:text-green-300">
            {appliedPromo.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="promo-code" className="flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Código promocional (opcional)
        </Label>
        <div className="flex gap-2">
          <Input
            id="promo-code"
            placeholder="Ej: BETA50"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && validatePromoCode()}
            disabled={isValidating}
          />
          <Button 
            onClick={validatePromoCode}
            disabled={isValidating || !promoCode.trim()}
            variant="outline"
            size="sm"
          >
            {isValidating ? "Validando..." : "Aplicar"}
          </Button>
        </div>
      </div>
      
      {/* Mostrar códigos disponibles como sugerencias */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPromoCode("BETA50");
            validatePromoCode();
          }}
          className="text-xs h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          BETA50 (-50%)
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPromoCode("WELCOME25");
            validatePromoCode();
          }}
          className="text-xs h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          WELCOME25 (-25%)
        </Button>
      </div>
    </div>
  );
}