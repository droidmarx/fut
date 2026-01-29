'use client';

import React, { createContext, useContext } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

// This context and provider are to ensure that Firebase is only initialized *once*
// on the client-side, even with suspense boundaries and concurrent rendering.
const FirebaseClientContext = createContext(false);

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isInitialized = useContext(FirebaseClientContext);

  if (!isInitialized) {
    initializeFirebase();
  }

  return (
    <FirebaseClientContext.Provider value={true}>
      <FirebaseProvider {...initializeFirebase()}>{children}</FirebaseProvider>
    </FirebaseClientContext.Provider>
  );
}
