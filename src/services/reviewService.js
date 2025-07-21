import api from './api';

const reviewService = {
  /**
   * Récupère tous les avis avec pagination et filtres
   * @param {number} page - Numéro de page
   * @param {object} filters - Filtres (search, approuve, etc.)
   * @returns {Promise<object>} - Données paginées des avis
   */
  getAllReviews: async (page = 1, filters = {}) => {
    try {
      const params = { page, ...filters };
      const response = await api.get('/v1/products/avis/', { params });
      const data = response.data;
      // Si le backend renvoie un tableau plutôt qu'un objet paginé
      if (Array.isArray(data)) {
        return {
          count: data.length,
          results: data
        };
      }
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      throw error;
    }
  },

  /**
   * Récupère un avis par son ID
   * @param {number} id - ID de l'avis
   * @returns {Promise<object>} - Détails de l'avis
   */
  getReviewById: async (id) => {
    try {
      const response = await api.get(`/v1/products/avis/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'avis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Approuve ou désapprouve un avis
   * @param {number} id - ID de l'avis
   * @param {boolean} approved - Statut d'approbation
   * @returns {Promise<object>} - Avis mis à jour
   */
  updateReviewApproval: async (id, approved) => {
    try {
      const response = await api.patch(`/v1/products/avis/${id}/`, { approuve: approved });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'avis ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un avis
   * @param {number} id - ID de l'avis
   * @returns {Promise<void>}
   */
  deleteReview: async (id) => {
    try {
      await api.delete(`/v1/products/avis/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'avis ${id}:`, error);
      throw error;
    }
  }
};

export default reviewService;
