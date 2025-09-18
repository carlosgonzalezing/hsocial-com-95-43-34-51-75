import { ReactNode } from "react";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MobileFormWizard } from "./MobileFormWizard";
import { DesktopFormLayout } from "./DesktopFormLayout";

interface UnifiedFormLayoutProps {
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

export function UnifiedFormLayout(props: UnifiedFormLayoutProps) {
  const { shouldUseMobileLayout } = useMobileDetection();

  if (shouldUseMobileLayout) {
    return (
      <MobileFormWizard
        currentStep={props.currentStep}
        totalSteps={props.totalSteps}
        onNext={props.onNext}
        onPrevious={props.onPrevious}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
        isSubmitting={props.isSubmitting}
        isNextEnabled={props.isNextEnabled}
        isLastStep={props.isLastStep}
        stepTitles={props.stepTitles}
      >
        {props.children}
      </MobileFormWizard>
    );
  }

  return (
    <DesktopFormLayout
      title={props.title}
      description={props.description}
      currentStep={props.currentStep}
      totalSteps={props.totalSteps}
      onNext={props.onNext}
      onPrevious={props.onPrevious}
      onCancel={props.onCancel}
      onSubmit={props.onSubmit}
      isSubmitting={props.isSubmitting}
      isNextEnabled={props.isNextEnabled}
      isLastStep={props.isLastStep}
      stepTitles={props.stepTitles}
    >
      {props.children}
    </DesktopFormLayout>
  );
}