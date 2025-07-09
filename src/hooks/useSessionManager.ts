import { useEffect, useCallback } from 'react';

interface UseSessionManagerProps {
  isSignedIn: boolean;
  authToken: string | null;
  handleSignOut: () => Promise<void>;
}

export const useSessionManager = ({ isSignedIn, authToken, handleSignOut }: UseSessionManagerProps) => {
  // Check for valid session on app load
  const validateSession = useCallback(() => {
    if (!authToken && isSignedIn) {
      // Invalid state - signed in but no token
      handleSignOut();
      return;
    }
    
    // Check if token is expired (basic check)
    if (authToken) {
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            // Token is expired
            console.log('Token expired, signing out');
            handleSignOut();
          }
        }
      } catch (error) {
        console.warn('Error validating token:', error);
        // Invalid token format, sign out
        handleSignOut();
      }
    }
  }, [authToken, isSignedIn, handleSignOut]);

  // Auto-logout on tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isSignedIn) {
        // Note: This doesn't actually sign out, it just warns the user
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? You will be signed out.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSignedIn]);

  // Validate session on mount and when dependencies change
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Check for session timeout (optional - can be enabled if needed)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isSignedIn && authToken) {
      // Auto-logout after 8 hours of inactivity
      const EIGHT_HOURS = 8 * 60 * 60 * 1000;
      
      const resetTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          alert('Your session has expired due to inactivity. Please sign in again.');
          handleSignOut();
        }, EIGHT_HOURS);
      };

      // Reset timeout on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, resetTimeout, { passive: true });
      });

      // Initial timeout
      resetTimeout();

      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => {
          document.removeEventListener(event, resetTimeout);
        });
      };
    }
  }, [isSignedIn, authToken, handleSignOut]);

  return {
    validateSession
  };
};