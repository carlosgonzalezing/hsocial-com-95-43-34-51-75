import { useState } from 'react';
import { SocialScoolHeader } from './SocialScoolHeader';
import { SocialScoolSidebar } from './SocialScoolSidebar';
import { SocialScoolRightSidebar } from './SocialScoolRightSidebar';
import { SocialScoolBottomNavigation } from './SocialScoolBottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface SocialScoolLayoutProps {
  children: React.ReactNode;
}

export function SocialScoolLayout({ children }: SocialScoolLayoutProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("home");

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <SocialScoolHeader />
        <main className="pt-16 pb-20">
          {children}
        </main>
        <SocialScoolBottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
    );
  }

  // Desktop layout - 3 column
  return (
    <div className="min-h-screen bg-background">
      <SocialScoolHeader />
      <div className="pt-16 flex">
        {/* Left Sidebar */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-80 z-10">
          <SocialScoolSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-80 xl:mr-80">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Right Sidebar */}
        <div className="hidden xl:block fixed right-0 top-16 bottom-0 w-80 z-10">
          <SocialScoolRightSidebar />
        </div>
      </div>
    </div>
  );
}