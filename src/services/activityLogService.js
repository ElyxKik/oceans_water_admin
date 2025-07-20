import api from './api';

const activityLogService = {
  // Récupérer tous les logs d'activité avec filtrage
  getLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres à la requête
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/activity-logs/logs/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs d\'activité:', error);
      throw error;
    }
  },

  // Récupérer un log d'activité spécifique
  getLog: async (id) => {
    try {
      const response = await api.get(`/activity-logs/logs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du log d'activité #${id}:`, error);
      throw error;
    }
  },

  // Récupérer les statistiques des logs d'activité
  getStatistics: async () => {
    try {
      const response = await api.get('/activity-logs/logs/statistics/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Récupérer la liste des modules disponibles
  getModules: async () => {
    try {
      const response = await api.get('/activity-logs/logs/modules/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      throw error;
    }
  },

  // Récupérer la liste des types d'action disponibles
  getActionTypes: async () => {
    try {
      const response = await api.get('/activity-logs/logs/action-types/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types d\'action:', error);
      throw error;
    }
  },

  // Récupérer la liste des niveaux de sévérité
  getSeverities: async () => {
    try {
      const response = await api.get('/activity-logs/logs/severities/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des niveaux de sévérité:', error);
      throw error;
    }
  },

  // Supprimer des logs d'activité (réservé aux fondateurs)
  clearLogs: async (data) => {
    try {
      const response = await api.post('/activity-logs/logs/clear/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression des logs:', error);
      throw error;
    }
  }
};

export default activityLogService;
