import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole, ROLES } from '../contexts/RoleContext';

// Composant qui redirige les livreurs vers la page des livraisons en attente
// et laisse les autres utilisateurs accéder au tableau de bord
const LivreurRedirect = ({ children }) => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();

  // Si l'utilisateur est un livreur, rediriger vers livraisons-attente
  if (userRole === ROLES.LIVREUR) {
    return <Navigate to="/mes-livraisons" replace />;
  }

  // Sinon, afficher le contenu normal (Dashboard)
  return children;
};

export default LivreurRedirect;
