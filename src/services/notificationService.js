import api from './api';

const notificationService = {
  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   * @param {Object} params - Paramètres de pagination et filtrage
   * @returns {Promise} - Promise contenant les notifications
   */
  getUserNotifications: async (params = {}) => {
    try {
      const response = await api.get('/v1/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  /**
   * Récupère le nombre de notifications non lues
   * @returns {Promise} - Promise contenant le nombre de notifications non lues
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/v1/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      return 0;
    }
  },

  /**
   * Marque une notification comme lue
   * @param {number} id - ID de la notification
   * @returns {Promise} - Promise contenant la notification mise à jour
   */
  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/v1/notifications/${id}`, {
        lue: true
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  /**
   * Marque toutes les notifications comme lues
   * @returns {Promise} - Promise contenant le résultat de l'opération
   */
  markAllAsRead: async () => {
    try {
      const response = await api.post('/v1/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },

  /**
   * Supprime une notification
   * @param {number} id - ID de la notification
   * @returns {Promise} - Promise contenant le résultat de l'opération
   */
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }
};

export default notificationService;
