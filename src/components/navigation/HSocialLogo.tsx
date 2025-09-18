import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HSocialLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const HSocialLogo = ({ 
  className = "", 
  showText = false, 
  size = "md",
  onClick 
}: HSocialLogoProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the actual theme being used
  const currentTheme = theme === "system" ? systemTheme : theme;
  
  // Fallback to light theme during SSR or when theme is not loaded
  const logoSrc = mounted && currentTheme === "dark" 
    ? "/images/hsocial-logo-dark.png" 
    : "/images/hsocial-logo-light.png";

  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto", 
    lg: "h-12 w-auto"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  // Fallback gradient text if images don't load
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const content = (
    <div className={`flex items-center group ${className}`}>
      <div className="relative">
        {imageError || !mounted ? (
          // Fallback to gradient text
          <h1 className={`${textSizeClasses[size]} font-black bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent tracking-tight group-hover:scale-110 transition-transform duration-300`}>
            HSocial
          </h1>
        ) : (
          // Logo image
          <img
            src={logoSrc}
            alt="HSocial"
            className={`${sizeClasses[size]} group-hover:scale-110 transition-transform duration-300`}
            onError={handleImageError}
          />
        )}
        {showText && (
          <span className="ml-2 font-semibold text-foreground">
            HSocial
          </span>
        )}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 blur-sm rounded-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <Link to="/" className="cursor-pointer">
      {content}
    </Link>
  );
};