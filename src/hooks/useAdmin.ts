import { useState, useEffect } from 'react';
import { adminLogin } from '@/lib/pocketbase';

export function useAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAdmin = async () => {
      try {
        setLoading(true);
        await adminLogin();
        if (mounted) {
          setIsLoggedIn(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to login as admin');
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAdmin();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  return {
    isLoggedIn,
    loading,
    error
  };
} 