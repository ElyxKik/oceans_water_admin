import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationIcon = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Formater la date relative (il y a X minutes/heures/jours)
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'commande_recue':
        return '📦';
      case 'commande_confirmee':
      case 'changement_statut_commande':
        return '🔄';
      case 'commande_livree':
        return '✅';
      case 'commande_annulee':
        return '❌';
      case 'paiement_recu':
        return '💰';
      case 'promotion':
        return '🏷️';
      default:
        return '📣';
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <div 
        className="notification-icon" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span 
            className="notification-badge"
            style={{ 
              position: 'absolute', 
              top: '-8px', 
              right: '-8px', 
              backgroundColor: '#ef4444', 
              color: 'white',
              fontSize: '0.75rem', 
              borderRadius: '9999px', 
              padding: '0 4px',
              minWidth: '16px',
              textAlign: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div 
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: '-10px',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.375rem',
            zIndex: 50,
            marginTop: '0.5rem'
          }}
        >
          <div 
            className="notification-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
            <div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Tout marquer comme lu
              </button>
              <Link 
                to="/notifications"
                onClick={() => setIsOpen(false)}
                style={{
                  marginLeft: '0.75rem',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Voir tout
              </Link>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div 
                className="empty-state"
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}
              >
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.lue ? 'unread' : ''}`}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: notification.lue ? 'white' : '#f3f4f6',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (!notification.lue) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div 
                      className="notification-icon"
                      style={{
                        fontSize: '1.25rem',
                        marginTop: '0.125rem'
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content" style={{ flex: 1 }}>
                      <div 
                        className="notification-title"
                        style={{
                          fontWeight: notification.lue ? 'normal' : 'bold',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {notification.titre}
                      </div>
                      <div 
                        className="notification-message"
                        style={{
                          fontSize: '0.875rem',
                          color: '#4b5563',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {notification.message}
                      </div>
                      <div 
                        className="notification-time"
                        style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}
                      >
                        {formatRelativeTime(notification.date_creation)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 5 && (
            <div 
              className="notification-footer"
              style={{
                padding: '0.75rem 1rem',
                textAlign: 'center',
                borderTop: '1px solid #e5e7eb'
              }}
            >
              <Link 
                to="/notifications"
                onClick={() => setIsOpen(false)}
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Voir toutes les notifications ({notifications.length})
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
