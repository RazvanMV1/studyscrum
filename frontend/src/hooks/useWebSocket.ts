import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { NotificationMessage } from '../types/notification';

export const useWebSocket = (
  projectId: string | null,
  onMessage: (message: NotificationMessage) => void,
  accessToken: string | null
) => {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!projectId || !accessToken) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${import.meta.env.VITE_NOTIFICATION_WS_URL}?token=${accessToken}`
        ),
      onConnect: () => {
        console.log('WebSocket conectat');
        client.subscribe(`/topic/project/${projectId}`, (frame) => {
          try {
            const notification: NotificationMessage = JSON.parse(frame.body);
            onMessage(notification);
          } catch (e) {
            console.error('Eroare parsare notificare:', e);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket deconectat');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;
  }, [projectId, accessToken, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);
};
