/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

interface YjsContextType {
  ydoc: Y.Doc | null;
  indexeddbProvider: IndexeddbPersistence | null;
  isLoaded: boolean;
  clientId: number;
}

const YjsContext = createContext<YjsContextType | undefined>(undefined);

export const YjsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<IndexeddbPersistence | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [clientId, setClientId] = useState<number>(0);

  useEffect(() => {
    let localProvider: IndexeddbPersistence | null = null;
    let doc: Y.Doc | null = null;

    // Push initialization to the next tick loop to bypass cascading render checks
    const timer = setTimeout(() => {
      doc = new Y.Doc();
      localProvider = new IndexeddbPersistence('shadow-state-canvas-room', doc);
      const id = doc.clientID;

      setYdoc(doc);
      setProvider(localProvider);
      setClientId(id);

      localProvider.on('synced', () => {
        setIsLoaded(true);
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      if (localProvider) localProvider.destroy();
      if (doc) doc.destroy();
    };
  }, []);

  return (
    <YjsContext.Provider value={{ ydoc, indexeddbProvider: provider, isLoaded, clientId }}>
      {children}
    </YjsContext.Provider>
  );
};

export const useYjs = () => {
  const context = useContext(YjsContext);
  if (context === undefined) {
    throw new Error('useYjs must be consumed inside a valid YjsProvider structure.');
  }
  return context;
};