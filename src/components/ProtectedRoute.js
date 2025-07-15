import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';

/**
 * Composant de protection de route basé sur l'authentification et les rôles
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composant enfant à rendre si l'accès est autorisé
 * @param {string} [props.requiredRole] - Rôle minimum requis pour accéder à la route
 * @param {string} [props.requiredPermission] - Permission spécifique requise pour accéder à la route
 * @returns {React.ReactNode} - Le composant enfant ou une redirection
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { userRole, hasRole, hasPermission } = useRole();
  const location = useLocation();

  // Si l'authentification est en cours de chargement ou si l'utilisateur est authentifié mais que son rôle n'est pas encore déterminé, afficher un indicateur de chargement
  if (loading || (isAuthenticated() && userRole === null)) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated()) {
    // Rediriger vers la page de connexion avec l'URL actuelle comme destination après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier si l'utilisateur a le rôle requis
  if (requiredRole && !hasRole(requiredRole)) {
    // Rediriger vers une page d'accès refusé
    return <Navigate to="/acces-refuse" replace />;
  }

  // Vérifier si l'utilisateur a la permission requise
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Rediriger vers une page d'accès refusé
    return <Navigate to="/acces-refuse" replace />;
  }

  // Si toutes les vérifications sont passées, rendre le composant enfant
  return children;
};

export default ProtectedRoute;
