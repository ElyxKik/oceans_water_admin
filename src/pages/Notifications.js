import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, loadNotifications } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filtre par statut
    if (filter === 'unread' && notification.lue) return false;
    if (filter === 'read' && !notification.lue) return false;
    
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.titre.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Réinitialiser la page courante quand le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

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

  // Obtenir la couleur de fond en fonction du type de notification
  const getNotificationColor = (type) => {
    switch (type) {
      case 'commande_recue':
        return '#e0f2fe'; // Bleu clair
      case 'commande_confirmee':
      case 'changement_statut_commande':
        return '#fef3c7'; // Jaune clair
      case 'commande_livree':
        return '#dcfce7'; // Vert clair
      case 'commande_annulee':
        return '#fee2e2'; // Rouge clair
      case 'paiement_recu':
        return '#d1fae5'; // Vert menthe
      case 'promotion':
        return '#f3e8ff'; // Violet clair
      default:
        return '#f3f4f6'; // Gris clair
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Mes notifications</h2>
          <button
            onClick={markAllAsRead}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer'
            }}
          >
            Tout marquer comme lu
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white'
            }}
          >
            <option value="all">Toutes les notifications</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Chargement des notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          {searchTerm 
            ? 'Aucune notification ne correspond à votre recherche.' 
            : filter === 'unread' 
              ? 'Vous n\'avez pas de notifications non lues.' 
              : 'Vous n\'avez pas de notifications.'}
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {paginatedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.lue ? 'unread' : ''}`}
                style={{
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: notification.lue ? 'white' : '#f9fafb',
                  border: '1px solid #e5e7eb',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div
                    className="notification-icon"
                    style={{
                      fontSize: '1.5rem',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: getNotificationColor(notification.type)
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content" style={{ flex: 1 }}>
                    <div
                      className="notification-title"
                      style={{
                        fontWeight: notification.lue ? 'normal' : 'bold',
                        fontSize: '1.125rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {notification.titre}
                      {!notification.lue && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            marginLeft: '0.5rem'
                          }}
                        />
                      )}
                    </div>
                    <div
                      className="notification-message"
                      style={{
                        marginBottom: '0.5rem',
                        color: '#4b5563'
                      }}
                    >
                      {notification.message}
                    </div>
                    <div
                      className="notification-time"
                      style={{
                        fontSize: '0.875rem',
                        color: '#9ca3af'
                      }}
                    >
                      {formatDate(notification.date_creation)}
                    </div>
                  </div>
                </div>
                
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {!notification.lue && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  &laquo;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      backgroundColor: currentPage === page ? '#3b82f6' : 'white',
                      color: currentPage === page ? 'white' : 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
