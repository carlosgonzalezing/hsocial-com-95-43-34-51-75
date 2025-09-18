import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

interface MobileFormWizardProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isNextEnabled?: boolean;
  isLastStep?: boolean;
  stepTitles?: string[];
  children: React.ReactNode;
}

export function MobileFormWizard({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onCancel,
  onSubmit,
  isSubmitting = false,
  isNextEnabled = true,
  isLastStep = false,
  stepTitles = [],
  children
}: MobileFormWizardProps) {
  const { shouldUseMobileLayout } = useMobileDetection();
  const progress = (currentStep / totalSteps) * 100;

  if (!shouldUseMobileLayout) {
    // Desktop: show all content at once
    return (
      <div className="space-y-6">
        {children}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="sticky top-0 bg-background border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Paso {currentStep} de {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        {stepTitles[currentStep - 1] && (
          <h3 className="font-semibold text-lg">
            {stepTitles[currentStep - 1]}
          </h3>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                size="sm"
                className="px-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              size="sm"
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
          </div>

          {isLastStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !isNextEnabled}
              className="px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Publicando...
                </div>
              ) : (
                "Publicar"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              disabled={!isNextEnabled}
              className="px-6"
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}