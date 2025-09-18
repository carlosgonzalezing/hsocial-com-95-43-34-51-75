
import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { sendVerificationEmail } from "@/lib/auth/verification";
import { useTheme } from "next-themes";
import { Moon, Sun, CheckCircle } from "lucide-react";
import { RecoveryTokenHandler } from "@/components/auth/RecoveryTokenHandler";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const { theme, setTheme } = useTheme();

  // Check for verification success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setShowVerificationSuccess(true);
      setAuthMode('login');
      // Remove the parameter from URL without refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 10000);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Fallback recovery token check
  useEffect(() => {
    const hashFragment = window.location.hash;
    if (hashFragment) {
      const params = new URLSearchParams(hashFragment.substring(1));
      const type = params.get('type');
      const accessToken = params.get('access_token');
      
      console.log('🔍 Auth Page - Recovery token fallback check:', { type, hasToken: !!accessToken });
      
      if (type === 'recovery' && accessToken) {
        console.log('🔄 Auth Page - Redirecting to password reset');
        window.location.href = `/password-reset${hashFragment}`;
      }
    }
  }, []);

  // SEO: set dynamic title, description, and canonical
  useEffect(() => {
    const title = authMode === 'login' ? 'Iniciar sesión | H1Z' : 'Crear cuenta | H1Z';
    const description = authMode === 'login'
      ? 'Inicia sesión en H1Z para conectar con amigos, compartir ideas y disfrutar contenido.'
      : 'Crea tu cuenta en H1Z para publicar ideas, hacer amigos y entretenerte.';
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/auth');
  }, [authMode]);


  return (
    <>
      <RecoveryTokenHandler />
      <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8 sm:py-12 relative" role="main">
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <div className="w-full max-w-md space-y-6 bg-background rounded-lg shadow-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
          <h1 className="text-2xl font-semibold">
            {authMode === 'login' ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {authMode === 'login' ? "Bienvenido de nuevo" : "Regístrate para comenzar"}
          </p>
        </div>

        {/* Verification Success Alert */}
        {showVerificationSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              ¡Cuenta verificada exitosamente! Ya puedes iniciar sesión con tu email y contraseña.
            </AlertDescription>
          </Alert>
        )}

        {authMode === 'login' ? (
          <LoginForm loading={loading} setLoading={setLoading} />
        ) : (
          <RegisterForm 
            loading={loading} 
            setLoading={setLoading} 
            sendVerificationEmail={sendVerificationEmail}
          />
        )}

        <div className="text-center">
          {authMode === 'login' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('register')}
              disabled={loading}
            >
              ¿No tienes cuenta? Crear cuenta
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('login')}
              disabled={loading}
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </Button>
          )}
        </div>
      </div>
      </main>
    </>
  );
}
