import api from './api';

const API_URL = '/v1/orders/livraisons/'; // Endpoint pour les livraisons

const deliveryService = {
  /**
   * Récupère les livraisons assignées au livreur connecté.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getMyDeliveries: () => {
    return api.get(API_URL); // Le ViewSet filtre automatiquement pour le livreur connecté
  },

  /**
   * Récupère toutes les livraisons avec pagination (pour admin/fondateur).
   * @param {number} page - Numéro de page.
   * @param {number} limit - Nombre d'éléments par page.
   * @param {string} search - Terme de recherche.
   * @param {string} status - Filtre par statut.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getAllDeliveries: (page = 1, limit = 10, search = '', status = '') => {
    let params = {
      page,
      limit,
    };
    
    if (search) {
      params.search = search;
    }
    
    if (status) {
      params.statut = status;
    }
    
    return api.get(API_URL, { params });
  },

  /**
   * Met à jour le statut d'une livraison.
   * @param {string} deliveryId - L'ID de la livraison.
   * @param {string} status - Le nouveau statut.
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateDeliveryStatus: (deliveryId, status) => {
    return api.patch(`${API_URL}${deliveryId}/`, { statut: status });
  },

  /**
   * Récupère les détails d'une livraison.
   * @param {string} deliveryId - L'ID de la livraison.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getDeliveryDetails: (deliveryId) => {
    return api.get(`${API_URL}${deliveryId}/`);
  },

  /**
   * Démarre une livraison.
   * @param {string} deliveryId - L'ID de la livraison.
   * @returns {Promise<AxiosResponse<any>>}
   */
  startDelivery: (deliveryId) => {
    return api.patch(`${API_URL}${deliveryId}/start_delivery/`);
  },

  /**
   * Termine une livraison avec succès.
   * @param {string} deliveryId - L'ID de la livraison.
   * @param {object} deliveryData - Les données de confirmation de livraison.
   * @returns {Promise<AxiosResponse<any>>}
   */
  completeDelivery: (deliveryId, deliveryData = {}) => {
    return api.patch(`${API_URL}${deliveryId}/complete_delivery/`, deliveryData);
  },

  /**
   * Signale un problème de livraison.
   * @param {string} deliveryId - L'ID de la livraison.
   * @param {object} issueData - Les données du problème.
   * @returns {Promise<AxiosResponse<any>>}
   */
  reportDeliveryIssue: (deliveryId, issueData) => {
    // Mettre à jour le statut et ajouter les notes
    return api.patch(`${API_URL}${deliveryId}/`, {
      statut: 'echec',
      notes_livreur: issueData.reason || 'Problème signalé'
    });
  }
};

export default deliveryService;
