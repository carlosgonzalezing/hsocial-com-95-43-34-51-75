import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
    
    // Prevent infinite loops by checking for DOM manipulation errors
    const isDOMError = error.message.includes('removeChild') || 
                      error.message.includes('insertBefore') || 
                      error.message.includes('Node') ||
                      error.name === 'NotFoundError';
    
    if (isDOMError) {
      console.warn('⚠️ DOM manipulation error detected - preventing potential infinite loop');
      // Force a page reload after a short delay if this keeps happening
      setTimeout(() => {
        if (this.state.hasError) {
          console.log('🔄 Reloading page to recover from DOM error');
          window.location.reload();
        }
      }, 3000);
    }
    
    // Handle AdSense related errors gracefully
    if (error.message.includes('adsbygoogle') || errorInfo.componentStack?.includes('AdComponent')) {
      console.warn('📢 AdSense error detected - component will be hidden');
      // Don't reload for ad errors, just hide the component
      return;
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-destructive mb-4">
              Algo salió mal
            </h2>
            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error inesperado. La página se recargará automáticamente en unos segundos.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
