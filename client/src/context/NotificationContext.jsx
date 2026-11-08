import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage to persist and share between tabs
  useEffect(() => {
    const saved = localStorage.getItem("trolly_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }

    // Listen for changes from other tabs
    const handleStorage = (e) => {
      if (e.key === "trolly_notifications") {
        setNotifications(JSON.parse(e.newValue || "[]"));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addNotification = (noti) => {
    const newNoti = {
      id: Date.now(),
      time: new Date().toISOString(),
      read: false,
      ...noti
    };
    setNotifications(prev => {
      const updated = [newNoti, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem("trolly_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("trolly_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("trolly_notifications");
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
