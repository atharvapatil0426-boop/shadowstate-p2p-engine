import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

interface WebrtcStatusEvent {
  status: 'connected' | 'connecting' | 'disconnected';
}

export const useP2PSync = (ydoc: Y.Doc | null) => {
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [isMeshConnected, setIsMeshConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!ydoc) return;

    let isActive = true;

    const getSignalingUrls = (): string[] => {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ['ws://localhost:4444'];
      }
      if (hostname.includes('devtunnels.ms')) {
        return [`wss://${hostname.replace('5173', '4444')}`];
      }
      return ['ws://localhost:4444'];
    };

    const webrtcProvider = new WebrtcProvider('shadow-state-mesh-network', ydoc, {
      signaling: getSignalingUrls(),
      peerOpts: {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      }
    });

    const syncPeerCount = () => {
      if (!isActive) return;
      // Get all active keys in the signaling room
      const peerKeys = Array.from(webrtcProvider.awareness.getStates().keys())
        .map((key) => key.toString())
        .filter((id) => id !== ydoc.clientID.toString());
      
      setConnectedPeers(peerKeys);
    };

    const timer = setTimeout(() => {
      if (isActive) {
        setProvider(webrtcProvider);
        setIsMeshConnected(webrtcProvider.connected);
        syncPeerCount();
      }
    }, 50);

    const handleStatusChange = (event: WebrtcStatusEvent) => {
      if (isActive) {
        setIsMeshConnected(event.status === 'connected' || webrtcProvider.connected);
        syncPeerCount();
      }
    };

    webrtcProvider.on('status', handleStatusChange as (event: unknown) => void);
    webrtcProvider.awareness.on('change', syncPeerCount);
    webrtcProvider.awareness.on('update', syncPeerCount);

    // Explicitly seed local state presence fields
    webrtcProvider.awareness.setLocalStateField('user', { 
      name: `Peer-${ydoc.clientID}`,
      active: true 
    });

    return () => {
      isActive = false;
      clearTimeout(timer);
      webrtcProvider.off('status', handleStatusChange as (event: unknown) => void);
      webrtcProvider.awareness.off('change', syncPeerCount);
      webrtcProvider.awareness.off('update', syncPeerCount);
      webrtcProvider.destroy();
    };
  }, [ydoc]);

  return { provider, connectedPeers, isMeshConnected };
};