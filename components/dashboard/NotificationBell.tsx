import React, { useState, useEffect, useRef } from 'react';

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  is_read: boolean;
  user: number;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log("No auth token, WebSocket not connected.");
        return;
      }
      
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use the current host, assuming frontend and backend are served from the same domain.
      // The backend Channels server needs to be running.
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications/?token=${token}`;
      
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        console.log('WebSocket connected');
        fetchInitialNotifications();
      };

      socket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification' && data.message) {
            const newNotification = data.message;
            setNotifications(prev => [newNotification, ...prev]);
            window.dispatchEvent(new CustomEvent('notification', { detail: newNotification }));
        }
      };

      socket.current.onclose = () => {
        console.log('WebSocket disconnected. It will be reconnected on the next component mount/page refresh.');
      };

      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.current?.close();
      };
    };

    connectWebSocket();

    return () => {
      socket.current?.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch initial notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch initial notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    // try {
    //   const token = localStorage.getItem('authToken');
    //   await fetch('/api/notifications/mark-all-as-read/', {
    //     method: 'POST',
    //     headers: { 'Authorization': `Bearer ${token}` },
    //   });
    // } catch (error) {
    //   console.error('Failed to mark notifications as read:', error);
    // }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline flex items-center">
                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
              </div>
            )}
          </div>
           <div className="p-2 bg-gray-50 dark:bg-gray-700/50 text-center">
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all notifications</a>
            </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
