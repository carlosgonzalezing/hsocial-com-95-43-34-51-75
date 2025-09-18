import { ReactNode } from "react";

interface DesktopFormStepProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function DesktopFormStep({ 
  children, 
  title, 
  description 
}: DesktopFormStepProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {(title || description) && (
        <div className="space-y-2 text-center">
          {title && (
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}