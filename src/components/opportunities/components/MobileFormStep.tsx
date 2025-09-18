import React from 'react';
import { cn } from '@/lib/utils';

interface MobileFormStepProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileFormStep({ 
  title, 
  description, 
  children, 
  className 
}: MobileFormStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h4 className="font-medium text-base">{title}</h4>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}