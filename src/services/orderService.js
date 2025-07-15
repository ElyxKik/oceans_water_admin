import api from './api';

const orderService = {
  // Récupérer toutes les commandes avec pagination et filtres
  getAllOrders: async (page = 1, filters = {}) => {
    try {
      const params = { page, ...filters };
      const response = await api.get('/v1/orders/commandes/', { params });
      const data = response.data;
      if (Array.isArray(data)) {
        return { count: data.length, results: data };
      }
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  },

  // Récupérer une commande par son ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/v1/orders/commandes/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la commande ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/v1/orders/commandes/${id}/`, { statut: status });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de la commande ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour une commande
  updateOrder: async (id, orderData) => {
    try {
      const payload = { ...orderData };
      if (payload.status && !payload.statut) {
        const map = {
          pending: 'en_attente',
          validated: 'confirmee',
          preparing: 'en_preparation',
          ready: 'prete_livraison',
          delivering: 'en_livraison',
          delivered: 'livree',
          cancelled: 'annulee'
        };
        payload.statut = map[payload.status] || payload.status;
        delete payload.status;
      }
      const response = await api.patch(`/v1/orders/commandes/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la commande ${id}:`, error);
      throw error;
    }
  },

  // Annuler une commande
  cancelOrder: async (id, reason) => {
    try {
      const response = await api.post(`/v1/orders/commandes/${id}/cancel/`, { raison: reason });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'annulation de la commande ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les livraisons
  getDeliveries: async (page = 1, filters = {}) => {
    try {
      const params = { page, ...filters };
      const response = await api.get('/v1/orders/livraisons/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons:', error);
      throw error;
    }
  },

  // Assigner un livreur à une commande
  assignDelivery: async (orderId, deliveryManId) => {
    try {
      const response = await api.post(`/v1/orders/commandes/${orderId}/assign-delivery/`, {
        livreur_id: deliveryManId
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'assignation du livreur à la commande ${orderId}:`, error);
      throw error;
    }
  },

  // Formater le statut d'une commande pour l'affichage
  formatOrderStatus: (status) => {
    const statusMap = {
      'en_attente': { label: 'En attente', color: 'gray' },
      'confirmee': { label: 'Confirmée', color: 'blue' },
      'en_preparation': { label: 'En préparation', color: 'orange' },
      'prete_livraison': { label: 'Prête pour livraison', color: 'purple' },
      'en_livraison': { label: 'En livraison', color: 'teal' },
      'livree': { label: 'Livrée', color: 'green' },
      'annulee': { label: 'Annulée', color: 'red' }
    };
    
    return statusMap[status] || { label: status, color: 'gray' };
  },

  // Formater le mode de paiement pour l'affichage
  formatPaymentMethod: (method) => {
    const methodMap = {
      'especes': 'Espèces',
      'carte': 'Carte bancaire',
      'mobile_money': 'Mobile Money',
      'a_la_livraison': 'Paiement à la livraison'
    };
    
    return methodMap[method] || method;
  },
  
  // Créer une nouvelle commande
  createOrder: async (orderData) => {
    try {
      // Utiliser le bon endpoint pour la création de commande
      const response = await api.post('/v1/orders/commandes/', orderData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  }
};

export default orderService;
