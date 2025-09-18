import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      
      if (navigator.onLine) {
        // Update user status to online and last_seen
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            supabase
              .from('profiles')
              .update({ 
                status: 'online', 
                last_seen: new Date().toISOString() 
              })
              .eq('id', data.user.id)
              .then(() => {
                console.log('User status updated to online');
              });
          }
        });
      }
    };

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Update status immediately
    updateOnlineStatus();
    
    // Update status every minute when online
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            supabase
              .from('profiles')
              .update({ 
                status: 'online', 
                last_seen: new Date().toISOString() 
              })
              .eq('id', data.user.id);
          }
        });
      }
    }, 60000); // Every minute

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}