import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Essayer d'abord de récupérer le profil complet
          try {
            const profileUser = await authService.fetchUserProfile();
            setCurrentUser(profileUser);
          } catch (profileErr) {
            // Si le profil complet n'est pas disponible, utiliser les données basiques
            const user = await authService.checkAuthStatus();
            setCurrentUser(user);
          }
        } catch (err) {
          setError('Session expirée. Veuillez vous reconnecter.');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      
      // Récupérer l'utilisateur depuis le localStorage après la connexion réussie
      // car authService.login a déjà enregistré les données utilisateur
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin: () => authService.isAdmin(),
    isAuthenticated: () => !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
