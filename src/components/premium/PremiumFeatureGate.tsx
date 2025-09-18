import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { usePremiumSubscription } from "@/hooks/use-premium-subscription";
import { useNavigate } from "react-router-dom";

interface PremiumFeatureGateProps {
  children: ReactNode;
  featureName: string;
  description: string;
  showUpgrade?: boolean;
}

export function PremiumFeatureGate({ 
  children, 
  featureName, 
  description, 
  showUpgrade = true 
}: PremiumFeatureGateProps) {
  const { isPremium, isLoading } = usePremiumSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-600" />
          <Lock className="h-5 w-5 text-yellow-600" />
        </div>
        <CardTitle className="text-yellow-800">
          Función Premium: {featureName}
        </CardTitle>
        <CardDescription className="text-yellow-700">
          {description}
        </CardDescription>
      </CardHeader>
      {showUpgrade && (
        <CardContent className="text-center">
          <Button 
            onClick={() => navigate('/premium')}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Actualizar a Premium
          </Button>
        </CardContent>
      )}
    </Card>
  );
}