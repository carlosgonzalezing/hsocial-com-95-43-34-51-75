import { ReactNode } from 'react';

interface HeaderProps {
  children: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4">
      {children}
    </header>
  );
}