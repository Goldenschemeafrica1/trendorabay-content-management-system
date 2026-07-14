import { useState, useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 60 * 1000; // Show warning 1 minute before timeout

export function useIdleTimeout(onTimeout, onWarning) {
  const [isIdle, setIsIdle] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsIdle(false);
    setShowWarning(false);
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      const remaining = IDLE_TIMEOUT - WARNING_TIME;
      setTimeRemaining(Math.floor(remaining / 1000));
      if (onWarning) onWarning();
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Set idle timeout
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      setShowWarning(false);
      if (onTimeout) onTimeout();
    }, IDLE_TIMEOUT);
  }, [onTimeout, onWarning]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [resetTimer]);

  // Countdown timer when warning is shown
  useEffect(() => {
    let countdownInterval;
    if (showWarning && timeRemaining > 0) {
      countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showWarning, timeRemaining]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    isIdle,
    showWarning,
    timeRemaining,
    extendSession,
  };
}
