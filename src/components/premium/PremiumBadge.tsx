import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePremiumSubscription } from "@/hooks/use-premium-subscription";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface PremiumBadgeProps {
  userId?: string;
  className?: string;
  variant?: "default" | "outline" | "subtle";
}

export function PremiumBadge({ userId, className = "", variant = "default" }: PremiumBadgeProps) {
  const { isPremium } = usePremiumSubscription();
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if specific user is premium when userId is provided
  useEffect(() => {
    if (userId) {
      const checkUserPremium = async () => {
        try {
          const { data, error } = await supabase.rpc('is_premium_user', {
            user_id_param: userId
          });
          
          if (!error) {
            setUserIsPremium(data);
          }
        } catch (error) {
          console.error('Error checking user premium status:', error);
        } finally {
          setLoading(false);
        }
      };
      
      checkUserPremium();
    } else {
      setUserIsPremium(isPremium);
      setLoading(false);
    }
  }, [userId, isPremium]);

  if (loading) return null;
  if (!userIsPremium) return null;

  const variants = {
    default: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0",
    outline: "border-2 border-yellow-500 text-yellow-700 bg-yellow-50",
    subtle: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  return (
    <Badge className={`${variants[variant]} ${className} flex items-center gap-1`}>
      <Crown className="h-3 w-3" />
      Premium
    </Badge>
  );
}