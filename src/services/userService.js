import api from './api';

const API_URL = '/accounts/management/'; // Correspond à l'URL enregistrée dans le routeur Django

const userService = {
  /**
   * Récupère la liste de tous les utilisateurs.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getUsers: () => {
    return api.get(API_URL);
  },

  /**
   * Crée un nouvel utilisateur.
   * @param {object} userData - Les données du nouvel utilisateur.
   * @returns {Promise<AxiosResponse<any>>}
   */
  createUser: (userData) => {
    return api.post(API_URL, userData);
  },

  /**
   * Met à jour les informations d'un utilisateur.
   * @param {string} id - L'ID de l'utilisateur.
   * @param {object} userData - Les données à mettre à jour.
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateUser: (id, userData) => {
    return api.patch(`${API_URL}${id}/`, userData);
  },

  /**
   * Supprime un utilisateur.
   * @param {string} id - L'ID de l'utilisateur.
   * @returns {Promise<AxiosResponse<any>>}
   */
  deleteUser: (id) => {
    return api.delete(`${API_URL}${id}/`);
  },

  /**
   * Met à jour le rôle d'un utilisateur.
   * @param {string} id - L'ID de l'utilisateur.
   * @param {string} role - Le nouveau rôle.
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateRole: (id, role) => {
    return api.patch(`${API_URL}${id}/update-role/`, { role });
  },

  /**
   * Réinitialise le mot de passe d'un utilisateur (action admin).
   * @param {string} id - L'ID de l'utilisateur.
   * @param {string} new_password - Le nouveau mot de passe.
   * @returns {Promise<AxiosResponse<any>>}
   */
  resetPassword: (id, new_password) => {
    return api.post(`${API_URL}${id}/set-password/`, { new_password });
  },
  /**
   * Récupère la liste des utilisateurs avec le rôle livreur.
   * @param {object} params - Paramètres optionnels (pagination, etc.)
   * @returns {Promise<AxiosResponse<any>>}
   */
  getDeliveryUsers: (params = {}) => {
    return api.get(`${API_URL}?role=livreur`, { params });
  },
};

export default userService;
