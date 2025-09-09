import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export default function RealtimeProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    try {
      // Note: WebSocket server would need to be implemented in backend
      // For now, we'll simulate with periodic updates
      setIsConnected(true);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        setOnlineUsers(Math.floor(Math.random() * 50) + 10);
        
        // Simulate occasional notifications
        if (Math.random() < 0.1) {
          addNotification({
            id: Date.now(),
            type: 'info',
            message: 'New claim requires verification',
            timestamp: new Date()
          });
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
      
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  };

  useEffect(() => {
    const cleanup = connect();
    
    return () => {
      if (cleanup) cleanup();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addRealtimeUpdate = (update) => {
    setRealtimeUpdates(prev => [update, ...prev.slice(0, 19)]);
  };

  // Simulate live activity feed
  useEffect(() => {
    const activities = [
      'New claim submitted: "Breaking: Scientists discover..."',
      'Claim verified as TRUE by @factchecker_pro',
      'High-reputation user joined the platform',
      'Claim flagged for misinformation',
      'Source reliability updated for CNN.com',
      'New verification added with supporting evidence'
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const activity = activities[Math.floor(Math.random() * activities.length)];
        addRealtimeUpdate({
          id: Date.now(),
          message: activity,
          timestamp: new Date(),
          type: 'activity'
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    isConnected,
    notifications,
    onlineUsers,
    realtimeUpdates,
    addNotification,
    removeNotification,
    addRealtimeUpdate
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}