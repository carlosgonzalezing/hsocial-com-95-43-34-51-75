import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Users, 
  MessageSquare, 
  Lightbulb, 
  ShoppingBag, 
  Trophy,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps = [
  {
    id: 1,
    title: "¡Bienvenido a H Social! 🎉",
    description: "La red social universitaria donde conectas, colaboras y creces académicamente.",
    icon: Heart,
    color: "text-pink-500"
  },
  {
    id: 2,
    title: "Sistema de Puntuación Social 📊",
    description: "Gana puntos por interacciones, publicaciones y ayudar a otros estudiantes. ¡Tu actividad importa!",
    icon: Trophy,
    color: "text-yellow-500",
    details: [
      "🔥 +5 puntos por publicar contenido",
      "❤️ +2 puntos por recibir likes",
      "💬 +3 puntos por comentarios útiles",
      "🤝 +10 puntos por hacer nuevos amigos"
    ]
  },
  {
    id: 3,
    title: "Conecta con Estudiantes 👥",
    description: "Encuentra compañeros de tu carrera, semestre y con intereses similares.",
    icon: Users,
    color: "text-blue-500"
  },
  {
    id: 4,
    title: "Marketplace Estudiantil 🛍️",
    description: "Compra, vende e intercambia libros, materiales y servicios con otros estudiantes.",
    icon: ShoppingBag,
    color: "text-green-500"
  },
  {
    id: 5,
    title: "Comparte Ideas y Proyectos 💡",
    description: "Publica tus ideas innovadoras y encuentra colaboradores para tus proyectos.",
    icon: Lightbulb,
    color: "text-purple-500"
  },
  {
    id: 6,
    title: "¡Comienza a Explorar! 🚀",
    description: "Ya tienes todo listo. ¡Empieza a conectar y hacer crecer tu red académica!",
    icon: MessageSquare,
    color: "text-indigo-500"
  }
];

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = tourSteps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className={`p-4 rounded-full bg-primary/10 ${currentStepData.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {currentStepData.details && (
                <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                  {currentStepData.details.map((detail, index) => (
                    <div key={index} className="text-sm">{detail}</div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progreso</span>
                    <span>{currentStep + 1} de {tourSteps.length}</span>
                  </div>
                  <Progress value={(currentStep + 1) / tourSteps.length * 100} className="w-full" />
                </div>

                <div className="flex justify-between gap-2">
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button variant="outline" onClick={handlePrevious}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                    )}
                    
                    <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                      Omitir tour
                    </Button>
                  </div>

                  <Button onClick={handleNext}>
                    {currentStep === tourSteps.length - 1 ? "¡Empezar!" : "Siguiente"}
                    {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}