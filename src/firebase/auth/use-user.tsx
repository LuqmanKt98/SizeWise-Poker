'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { useAuth } from '@/firebase/provider'; // Use this to get the auth instance

export interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to subscribe to the current user's authentication state from Firebase.
 *
 * @returns {UseUserResult} An object containing the user, loading state, and error.
 */
export function useUser(): UseUserResult {
  const auth = useAuth(); // Get the auth instance from the context

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If auth instance is not available yet, do nothing.
    if (!auth) {
      setIsLoading(false); // Not loading if there's no auth to check
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error) => {
        console.error("useUser: onAuthStateChanged error:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Re-run effect if the auth instance changes

  return { user, isLoading, error };
}
