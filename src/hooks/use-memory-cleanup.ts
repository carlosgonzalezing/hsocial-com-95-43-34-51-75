import { useEffect, useCallback } from 'react';

export function useMemoryCleanup() {
  const forceGarbageCollection = useCallback(() => {
    // Force garbage collection if available (Chrome DevTools)
    if (window.gc) {
      window.gc();
    }
    
    // Clear any unused timers or intervals
    const highestTimeoutId = setTimeout(';');
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    
    // Clear any unused intervals
    const highestIntervalId = setInterval(';');
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
    
    console.log('🗑️ Memory cleanup performed');
  }, []);

  const clearUnusedObjects = useCallback(() => {
    // Clear URL objects that might be lingering
    const urlObjects = (window as any).__URL_OBJECTS__ || [];
    urlObjects.forEach((url: string) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore errors for already revoked URLs
      }
    });
    
    // Clear the tracking array
    (window as any).__URL_OBJECTS__ = [];
  }, []);

  useEffect(() => {
    // Cleanup on component mount
    clearUnusedObjects();
    
    // Set up periodic cleanup
    const cleanup = setInterval(() => {
      clearUnusedObjects();
      
      // Force GC every 5 minutes in development
      if (process.env.NODE_ENV === 'development') {
        forceGarbageCollection();
      }
    }, 5 * 60 * 1000);

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      clearUnusedObjects();
      forceGarbageCollection();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(cleanup);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearUnusedObjects();
    };
  }, [clearUnusedObjects, forceGarbageCollection]);

  return {
    forceGarbageCollection,
    clearUnusedObjects
  };
}

// Track URL objects for cleanup
const originalCreateObjectURL = URL.createObjectURL;
URL.createObjectURL = function(object: File | MediaSource | Blob) {
  const url = originalCreateObjectURL.call(this, object);
  
  // Track the URL for cleanup
  const urlObjects = (window as any).__URL_OBJECTS__ || [];
  urlObjects.push(url);
  (window as any).__URL_OBJECTS__ = urlObjects;
  
  return url;
};