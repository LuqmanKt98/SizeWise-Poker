'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Firebase only on the client side after hydration
    try {
      const services = initializeFirebase();
      setFirebaseServices(services);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      setIsInitialized(true);
    }
  }, []);

  // During SSR/SSG, render children without Firebase provider
  // Firebase will be initialized on the client side after hydration
  if (!isInitialized || !firebaseServices) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
