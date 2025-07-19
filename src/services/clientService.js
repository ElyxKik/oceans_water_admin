import api from './api';

const clientService = {
  // Récupérer tous les clients avec pagination et filtres
  getAllClients: async (page = 1, filters = {}) => {
    try {
      // Paramètres de requête
      const params = { page, ...filters };
      
      // Essayer d'abord avec le chemin direct vers les utilisateurs
      try {
        console.log('Tentative d\'accès direct aux utilisateurs');
        const response = await api.get('/accounts/management/', { params });
        const data = response.data;
        
        // Normaliser la réponse
        if (Array.isArray(data)) {
          console.log('Données reçues sous forme de tableau');
          return { results: data, count: data.length };
        } else if (data && data.results && Array.isArray(data.results)) {
          console.log('Données reçues avec pagination');
          return data;
        } else {
          console.log('Format de données inattendu, tentative d\'adaptation');
          // Essayer d'extraire les données utilisateur
          if (data && typeof data === 'object') {
            // Si c'est un seul utilisateur
            if (data.id && (data.username || data.email)) {
              return { results: [data], count: 1 };
            }
            
            // Chercher des tableaux dans l'objet qui pourraient contenir des utilisateurs
            const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              return { results: possibleArrays[0], count: possibleArrays[0].length };
            }
          }
          
          console.warn('Impossible d\'extraire des données utilisateur');
          return { results: [], count: 0 };
        }
      } catch (error) {
        console.log('Erreur avec le chemin direct, tentative avec chemin alternatif', error);
        
        // Essayer avec un autre chemin
        try {
          const response = await api.get('/accounts/users/', { params });
          const data = response.data;
          
          if (Array.isArray(data)) {
            return { results: data, count: data.length };
          } else if (data && data.results && Array.isArray(data.results)) {
            return data;
          } else {
            console.warn('Format de réponse inattendu sur le chemin alternatif');
            return { results: [], count: 0 };
          }
        } catch (alternativeError) {
          // Dernier recours: essayer avec l'API v1
          try {
            const response = await api.get('/v1/accounts/users/', { params });
            const data = response.data;
            
            if (Array.isArray(data)) {
              return { results: data, count: data.length };
            } else if (data && data.results && Array.isArray(data.results)) {
              return data;
            } else {
              console.warn('Aucun chemin n\'a fonctionné pour récupérer les utilisateurs');
              return { results: [], count: 0 };
            }
          } catch (finalError) {
            console.error('Toutes les tentatives ont échoué:', finalError);
            return { results: [], count: 0 };
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return { results: [], count: 0 };
    }
  },

  // Récupérer un client par son ID
  getClientById: async (id) => {
    try {
      const response = await api.get(`/v1/accounts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du client ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour un client
  updateClient: async (id, clientData) => {
    try {
      const response = await api.patch(`/v1/accounts/management/${id}/`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les commandes d'un client
  getClientOrders: async (id) => {
    try {
      const response = await api.get(`/v1/accounts/${id}/commandes/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des commandes du client ${id}:`, error);
      throw error;
    }
  },

  // Désactiver un compte client
  deactivateClient: async (id) => {
    try {
      const response = await api.patch(`/v1/accounts/management/${id}/`, { is_active: false });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la désactivation du client ${id}:`, error);
      throw error;
    }
  },

  // Réactiver un compte client
  activateClient: async (id) => {
    try {
      const response = await api.patch(`/v1/accounts/management/${id}/`, { is_active: true });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réactivation du client ${id}:`, error);
      throw error;
    }
  },

  // Formater le nom complet d'un client
  formatClientName: (client) => {
    if (!client) return '';
    
    const firstName = client.first_name || '';
    const lastName = client.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return client.username || client.email || 'Client sans nom';
    }
  },

  // Générer les initiales d'un client pour l'avatar
  getClientInitials: (client) => {
    if (!client) return '';
    
    const firstName = client.first_name || '';
    const lastName = client.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (client.username) {
      return client.username.charAt(0).toUpperCase();
    } else if (client.email) {
      return client.email.charAt(0).toUpperCase();
    } else {
      return 'C';
    }
  }
};

export default clientService;
