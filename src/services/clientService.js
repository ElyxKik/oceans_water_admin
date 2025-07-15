import api from './api';

const clientService = {
  // Récupérer tous les clients avec pagination et filtres
  getAllClients: async (page = 1, filters = {}) => {
    try {
      const params = { page, ...filters };
      
      // Étape 1: Obtenir le lien vers les utilisateurs
      try {
        const rootResponse = await api.get('/v1/accounts/', { params: { page } });
        const rootData = rootResponse.data;
        console.log('Réponse racine API:', rootData);
        
        // Si nous avons un lien HATEOAS vers les utilisateurs
        if (rootData && rootData.users && typeof rootData.users === 'string') {
          console.log('Lien HATEOAS détecté:', rootData.users);
          
          // Étape 2: Suivre le lien HATEOAS pour obtenir les utilisateurs
          try {
            // Extraire le chemin relatif de l'URL complète
            const usersPath = rootData.users.replace(api.defaults.baseURL, '');
            console.log('Chemin relatif des utilisateurs:', usersPath);
            
            // Appliquer les filtres de recherche à la requête utilisateurs
            const usersParams = { page, ...filters };
            if (filters.search) {
              usersParams.search = filters.search;
              console.log('Paramètre de recherche appliqué:', usersParams.search);
            }
            
            const usersResponse = await api.get(usersPath, { params: usersParams });
            const usersData = usersResponse.data;
            console.log('Données utilisateurs:', usersData);
            
            // Normaliser la réponse
            if (Array.isArray(usersData)) {
              return { results: usersData, count: usersData.length };
            } else if (usersData && usersData.results && Array.isArray(usersData.results)) {
              return usersData;
            } else {
              console.warn('Format de données utilisateurs inattendu:', usersData);
              return { results: [], count: 0 };
            }
          } catch (usersError) {
            console.error('Erreur lors de la récupération des utilisateurs via HATEOAS:', usersError);
            return { results: [], count: 0 };
          }
        }
        
        // Traitement standard si ce n'est pas un format HATEOAS
        if (Array.isArray(rootData)) {
          return { results: rootData, count: rootData.length };
        } else if (rootData && rootData.results && Array.isArray(rootData.results)) {
          return rootData;
        } else {
          console.warn('Format de réponse inattendu (non HATEOAS):', rootData);
          return { results: [], count: 0 };
        }
      } catch (rootError) {
        console.log('Erreur avec /v1/accounts/, tentative avec chemin alternatif');
        
        // Essayer avec le chemin sans v1
        try {
          const response = await api.get('/accounts/', { params: { page } });
          const data = response.data;
          
          // Même logique HATEOAS pour le chemin alternatif
          if (data && data.users && typeof data.users === 'string') {
            const usersPath = data.users.replace(api.defaults.baseURL, '');
            
            // Appliquer les filtres de recherche à la requête utilisateurs
            const usersParams = { page, ...filters };
            if (filters.search) {
              usersParams.search = filters.search;
              console.log('Paramètre de recherche appliqué (alternatif):', usersParams.search);
            }
            
            const usersResponse = await api.get(usersPath, { params: usersParams });
            const usersData = usersResponse.data;
            
            if (Array.isArray(usersData)) {
              return { results: usersData, count: usersData.length };
            } else if (usersData && usersData.results && Array.isArray(usersData.results)) {
              return usersData;
            }
          }
          
          // Traitement standard
          if (Array.isArray(data)) {
            return { results: data, count: data.length };
          } else if (data && data.results && Array.isArray(data.results)) {
            return data;
          } else {
            console.warn('Format de réponse alternatif inattendu:', data);
            return { results: [], count: 0 };
          }
        } catch (altError) {
          console.error('Échec de toutes les tentatives de récupération des clients:', altError);
          return { results: [], count: 0 };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      throw error;
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
      const response = await api.patch(`/v1/accounts/${id}/`, clientData);
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
      const response = await api.patch(`/v1/accounts/${id}/`, { is_active: false });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la désactivation du client ${id}:`, error);
      throw error;
    }
  },

  // Réactiver un compte client
  activateClient: async (id) => {
    try {
      const response = await api.patch(`/v1/accounts/${id}/`, { is_active: true });
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
