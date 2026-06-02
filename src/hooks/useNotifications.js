import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useNotifications() {
  const socketRef = useRef(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    // Connect to WebSocket server
    const socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Notifications] Connected to server');
      socket.emit('set-username', `user_${Math.floor(Math.random() * 10000)}`);
    });

    socket.on('receive-notification', (data) => {
      console.log('[Notifications] Received:', data);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('CodeRunner', {
          body: `${data.message}`,
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: 'coderunner-notification',
          requireInteraction: false,
          vibrate: [200, 100, 200],
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('[Notifications] Error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendNotification = (message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send-notification', { message });
    } else {
      console.warn('WebSocket not connected');
    }
  };

  return { sendNotification };
}
