import api from './api';

// Mapping des rôles backend vers les rôles frontend
const ROLE_MAPPING = {
  'fondateur': 'fondateur',
  'administrateur': 'administrateur',
  'manager': 'manager',
  'gestionnaire': 'gestionnaire',
  'livreur': 'livreur'
};

const authService = {
  // Récupérer le profil complet de l'utilisateur
  fetchUserProfile: async () => {
    try {
      // Utiliser le chemin correct vers l'endpoint du profil utilisateur
      const response = await api.get('/accounts/me/');
      if (response.data) {
        // Déterminer le rôle en fonction des attributs utilisateur
        let user = response.data;
        
        if (!user.role) {
          if (user.is_superuser) {
            user.role = 'fondateur';
          } else if (user.is_staff) {
            user.role = 'administrateur';
          } else {
            // Rôle par défaut si non spécifié
            user.role = 'gestionnaire';
          }
        }
        
        // Normaliser le rôle selon notre mapping
        user.role = ROLE_MAPPING[user.role.toLowerCase()] || 'gestionnaire';
        
        // Sauvegarder les données utilisateur complètes
        localStorage.setItem('admin_user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      throw error;
    }
  },

  // Connecter un administrateur
  login: async (username, password) => {
    try {
      // L'API Django attend 'username', pas 'email'
      const response = await api.post('/v1/token-auth/', { username, password });
      if (response.data && response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        
        // Récupérer les données utilisateur depuis la réponse
        let user = response.data.user;
        
        // Si la réponse ne contient pas d'utilisateur, créer un objet utilisateur basique
        if (!user) {
          user = {
            username: username,
            is_staff: true,
            is_superuser: false,
            role: 'gestionnaire' // Rôle par défaut
          };
        }
        
        // Sauvegarder temporairement les données utilisateur basiques
        localStorage.setItem('admin_user', JSON.stringify(user));
        
        // Récupérer le profil complet de l'utilisateur
        try {
          const profileUser = await authService.fetchUserProfile();
          if (profileUser) {
            user = profileUser; // Utiliser les données complètes du profil
          }
        } catch (profileError) {
          console.warn('Impossible de récupérer le profil complet:', profileError);
          
          // Continuer avec les données basiques si le profil complet n'est pas disponible
          // Déterminer le rôle en fonction des attributs utilisateur
          if (!user.role) {
            if (user.is_superuser) {
              user.role = 'fondateur';
            } else if (user.is_staff) {
              user.role = 'administrateur';
            } else {
              // Rôle par défaut si non spécifié
              user.role = 'gestionnaire';
            }
          }
          
          // Normaliser le rôle selon notre mapping
          user.role = ROLE_MAPPING[user.role.toLowerCase()] || 'gestionnaire';
          
          localStorage.setItem('admin_user', JSON.stringify(user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Déconnecter un administrateur
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  // Vérifier si un utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: () => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Vérifier si l'utilisateur est un administrateur
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && (user.is_staff || user.is_superuser || user.role === 'administrateur' || user.role === 'fondateur');
  },
  
  // Obtenir le rôle de l'utilisateur
  getUserRole: () => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    
    // Déterminer le rôle en fonction des attributs utilisateur
    if (user.role) {
      return ROLE_MAPPING[user.role.toLowerCase()] || 'gestionnaire';
    }
    
    if (user.is_superuser) {
      return 'fondateur';
    } else if (user.is_staff) {
      return 'administrateur';
    }
    
    // Rôle par défaut
    return 'gestionnaire';
  },

  // Vérifier le token et récupérer les informations de l'utilisateur
  checkAuthStatus: async () => {
    try {
      // Utiliser le token existant pour vérifier l'authentification
      // Comme nous n'avons pas d'endpoint spécifique, nous utilisons les données stockées
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
      authService.logout();
      throw error;
    }
  }
};

export default authService;
