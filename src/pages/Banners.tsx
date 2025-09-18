import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/components/user-menu/hooks/useUserProfile";
import { countTotalHearts } from "@/lib/api/hearts";
import { getSocialLevels, type SocialLevel } from "@/lib/api/social-levels";
import { useToast } from "@/hooks/use-toast";

export default function Banners() {
  const { userId } = useUserProfile();
  const [hearts, setHearts] = useState(0);
  const [levels, setLevels] = useState<SocialLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => localStorage.getItem("selectedBannerId")
  );
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSocialLevels();
        setLevels(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchHearts = async () => {
      if (!userId) return;
      try {
        const count = await countTotalHearts(userId);
        setHearts(count);
      } catch (error) {
        console.error('Error fetching hearts count:', error);
      }
    };
    fetchHearts();
  }, [userId]);
  const isAutomatic = selectedId === null;
  const bestUnlockedId = useMemo(() => {
    const unlocked = levels.filter(l => hearts >= l.min_score);
    if (unlocked.length === 0) return null;
    return unlocked.reduce((prev, curr) => (curr.min_score > prev.min_score ? curr : prev)).id;
  }, [levels, hearts]);

  const isAllowed = (lvl: SocialLevel) => hearts >= lvl.min_score;

  const handleSelect = (id: string) => {
    const lvl = levels.find(l => l.id === id);
    if (!lvl) return;
    if (!isAllowed(lvl)) {
      toast({ variant: "destructive", title: "No disponible",
        description: "Aún no cumples el requisito de corazones para este banner." });
      return;
    }
    localStorage.setItem("selectedBannerId", id);
    setSelectedId(id);
    window.dispatchEvent(new Event('hsocial-banner-change'));
    toast({ title: "Banner aplicado", description: `Usando: ${lvl.level_name}` });
  };

  const clearSelection = () => {
    localStorage.removeItem("selectedBannerId");
    setSelectedId(null);
    window.dispatchEvent(new Event('hsocial-banner-change'));
    toast({ title: "Modo automático", description: "El banner cambiará según tu nivel." });
  };

  const switchToPersonalizado = () => {
    if (!bestUnlockedId) return;
    localStorage.setItem("selectedBannerId", bestUnlockedId);
    setSelectedId(bestUnlockedId);
    window.dispatchEvent(new Event('hsocial-banner-change'));
    toast({ title: "Modo personalizado", description: "Puedes elegir cualquier banner desbloqueado." });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/?menu=1')} aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Banners</h1>
        </div>
        <div className="flex gap-2">
          {isAutomatic ? (
            <Button variant="secondary" onClick={switchToPersonalizado}>Personalizado</Button>
          ) : (
            <Button variant="secondary" onClick={clearSelection}>Automático por nivel</Button>
          )}
        </div>
      </header>

      <p className="text-sm text-muted-foreground">
        Elige el banner de tu perfil entre los disponibles para tu nivel de corazones.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map(lvl => {
          const allowed = isAllowed(lvl);
          const active = isAutomatic ? lvl.id === bestUnlockedId : selectedId === lvl.id;
          return (
            <Card key={lvl.id} className={allowed ? "" : "opacity-60"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{lvl.level_name}</span>
                    {active && (
                      <span className="text-xs text-primary">{isAutomatic ? "Automático" : "Seleccionado"}</span>
                    )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="h-24 w-full rounded-md border"
                  style={{
                    background: `linear-gradient(135deg, ${lvl.color_from}, ${lvl.color_to})`,
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  {lvl.benefits?.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requiere {lvl.min_score} corazones{!allowed ? ` · Te faltan ${Math.max(0, lvl.min_score - hearts)}` : ""}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSelect(lvl.id)} disabled={!allowed}>
                    {allowed ? (active ? "Usando" : "Usar este banner") : "Bloqueado"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
