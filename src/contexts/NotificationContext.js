import React, { createContext, useState, useContext, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Charger les notifications et le compteur non lu
  const loadNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications();
      setNotifications(data.results || []);
      
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      
      // Mettre à jour l'état local
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === id ? { ...notif, lue: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Mettre à jour l'état local
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, lue: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      
      // Mettre à jour l'état local
      const notifToDelete = notifications.find(n => n.id === id);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif.id !== id)
      );
      
      // Si la notification était non lue, décrémenter le compteur
      if (notifToDelete && !notifToDelete.lue) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    loadNotifications();
    
    // Rafraîchir les notifications toutes les 60 secondes
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
