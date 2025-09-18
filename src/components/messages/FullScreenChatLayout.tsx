import { ReactNode } from "react";

interface FullScreenChatLayoutProps {
  children: ReactNode;
}

export const FullScreenChatLayout = ({ children }: FullScreenChatLayoutProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="h-full w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};