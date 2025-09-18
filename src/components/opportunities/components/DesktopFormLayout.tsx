import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DesktopFormLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isNextEnabled: boolean;
  isLastStep: boolean;
  stepTitles: string[];
  title: string;
  description?: string;
}

export function DesktopFormLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onCancel,
  onSubmit,
  isSubmitting,
  isNextEnabled,
  isLastStep,
  stepTitles,
  title,
  description
}: DesktopFormLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex h-full min-h-[600px] max-h-[85vh] bg-background">
      {/* Left sidebar with steps */}
      <div className="w-80 min-w-80 bg-muted/30 border-r border-border p-6 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium text-foreground">{currentStep}/{totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step navigation */}
          <div className="space-y-1">
            {stepTitles.map((stepTitle, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div
                  key={stepNumber}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : isCompleted
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-primary-foreground text-primary' 
                      : isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <span className="text-sm font-medium">{stepTitle}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom action buttons */}
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={onPrevious}
              disabled={currentStep === 1}
              className="flex-1 gap-2"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            {isLastStep ? (
              <Button 
                onClick={onSubmit}
                disabled={!isNextEnabled || isSubmitting}
                className="flex-1 gap-2"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    Crear
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={onNext}
                disabled={!isNextEnabled}
                className="flex-1 gap-2"
                size="sm"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border bg-background/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                {stepTitles[currentStep - 1]}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Paso {currentStep} de {totalSteps}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Form content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}