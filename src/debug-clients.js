// Script de débogage pour la page Clients
import api from './services/api';

// Fonction pour simuler le comportement de clientService.getAllClients
async function testGetAllClients(page = 1, filters = {}) {
  try {
    const params = { page, ...filters };
    
    console.log('1. Tentative avec /v1/accounts/');
    try {
      const response = await api.get('/v1/accounts/', { params });
      console.log('Réponse brute:', response);
      const data = response.data;
      console.log('Structure de données:', {
        isArray: Array.isArray(data),
        type: typeof data,
        hasResults: data && data.results ? true : false,
        resultsIsArray: data && data.results ? Array.isArray(data.results) : false,
        keys: data ? Object.keys(data) : []
      });
      return data;
    } catch (innerError) {
      console.log('Erreur avec /v1/accounts/:', innerError.message);
      
      console.log('2. Tentative avec /accounts/');
      const response = await api.get('/accounts/', { params });
      console.log('Réponse brute (fallback):', response);
      const data = response.data;
      console.log('Structure de données (fallback):', {
        isArray: Array.isArray(data),
        type: typeof data,
        hasResults: data && data.results ? true : false,
        resultsIsArray: data && data.results ? Array.isArray(data.results) : false,
        keys: data ? Object.keys(data) : []
      });
      return data;
    }
  } catch (error) {
    console.error('Erreur globale:', error.message);
    throw error;
  }
}

// Exporter la fonction pour l'utiliser dans le composant
export { testGetAllClients };
