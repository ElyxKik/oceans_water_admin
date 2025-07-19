import api from './api';

const productService = {
  // Récupérer tous les produits avec pagination et filtres
  getAllProducts: async (page = 1, filters = {}) => {
    try {
      const params = { page, ...filters };
      const response = await api.get('/v1/products/produits/', { params });
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
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  },

  // Récupérer un produit par son ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/v1/products/produits/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau produit
  createProduct: async (productData) => {
    try {
      // Si productData contient une image sous forme de File, on utilise FormData
      if (productData.image instanceof File) {
        const formData = new FormData();
        Object.keys(productData).forEach(key => {
          formData.append(key, productData[key]);
        });
        const response = await api.post('/v1/products/produits/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Sinon, on envoie les données JSON normalement
        const response = await api.post('/v1/products/produits/', productData);
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  },

  // Mettre à jour un produit existant
  updateProduct: async (id, productData) => {
    try {
      // Si productData contient une image sous forme de File, on utilise FormData
      if (productData.image instanceof File) {
        const formData = new FormData();
        Object.keys(productData).forEach(key => {
          formData.append(key, productData[key]);
        });
        const response = await api.put(`/v1/products/produits/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Sinon, on envoie les données JSON normalement
        const response = await api.patch(`/v1/products/produits/${id}/`, productData);
        return response.data;
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du produit ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    try {
      await api.delete(`/v1/products/produits/${id}/`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit ${id}:`, error);
      throw error;
    }
  },

  // Récupérer toutes les catégories
  getAllCategories: async () => {
    try {
      const response = await api.get('/v1/products/categories/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  },

  // Récupérer toutes les marques
  getAllBrands: async () => {
    try {
      const response = await api.get('/v1/products/marques/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des marques:', error);
      throw error;
    }
  }
};

export default productService;
