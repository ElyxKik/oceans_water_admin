import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useRole, PERMISSIONS, ROLES } from "../contexts/RoleContext";
import { useState, useEffect } from "react";

// Définition des liens avec leurs permissions requises
const allLinks = [
  { 
    path: "/", 
    label: "🏠 Tableau de bord",
    // Accessible à tous les utilisateurs authentifiés
    requiredPermission: null,
    requiredRole: null
  },
  {
    path: "/profil",
    label: "👤 Profil",
    requiredPermission: null,
    requiredRole: null
  },
  {
    path: "/utilisateurs",
    label: "👥 Gestion utilisateurs",
    requiredPermission: PERMISSIONS.MANAGE_USERS,
    requiredRole: null
  },
  { 
    path: "/commandes", 
    label: "📦 Commandes",
    requiredPermission: PERMISSIONS.VIEW_ALL_ORDERS,
    requiredRole: ROLES.GESTIONNAIRE,
    requiredRole: null
  },
  { 
    path: "/produits", 
    label: "🛒 Produits",
    requiredPermission: PERMISSIONS.VIEW_PRODUCTS,
    requiredRole: ROLES.GESTIONNAIRE,
    requiredRole: null
  },

  { 
    path: "/clients", 
    label: "👥 Clients",
    requiredPermission: PERMISSIONS.VIEW_CLIENT_DETAILS,
    requiredRole: null
  },
  { 
    path: "/journaux-activite", 
    label: "📓 Journaux d'activité",
    requiredPermission: PERMISSIONS.VIEW_ALL_LOGS,
    requiredRole: null
  },
  { 
    path: "/avis", 
    label: "⭐ Avis & Commentaires",
    requiredRole: ROLES.MANAGER,
    requiredPermission: null
  },
  { 
    path: "/livraisons-attente", 
    label: "📋 Livraisons en attente",
    requiredRole: ROLES.LIVREUR,
    requiredPermission: null
  },
  { 
    path: "/mes-livraisons", 
    label: "🚚 Mes livraisons",
    requiredRole: ROLES.LIVREUR,
    requiredPermission: null
  },
  { 
    path: "/messages", 
    label: "📩 Messages",
    requiredRole: ROLES.MANAGER,
    requiredPermission: null
  },
  { 
    path: "/parametres", 
    label: "⚙ Paramètres",
    requiredRole: ROLES.ADMINISTRATEUR,
    requiredPermission: null
  },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { logout, currentUser } = useAuth();
  const { hasPermission, hasRole, userRole } = useRole();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Filtrer les liens en fonction des permissions de l'utilisateur
  const links = allLinks.filter(link => {
    // Cas spécial pour les liens réservés uniquement aux livreurs
    if ((link.path === "/livraisons-attente" || link.path === "/mes-livraisons") && userRole !== ROLES.LIVREUR) {
      return false;
    }
    
    // Si aucune permission ou rôle n'est requis, le lien est accessible
    if (!link.requiredPermission && !link.requiredRole) return true;
    
    // Vérifier si l'utilisateur a la permission requise
    if (link.requiredPermission && hasPermission(link.requiredPermission)) return true;
    
    // Vérifier si l'utilisateur a le rôle requis
    if (link.requiredRole && hasRole(link.requiredRole)) return true;
    
    return false;
  });
  
  // Gestion du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileOpen]);
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  // Fonction pour obtenir le nom du rôle en français
  const getRoleName = (role) => {
    switch (role) {
      case ROLES.FONDATEUR: return 'Fondateur';
      case ROLES.ADMINISTRATEUR: return 'Administrateur';
      case ROLES.MANAGER: return 'Manager';
      case ROLES.GESTIONNAIRE: return 'Gestionnaire';
      case ROLES.LIVREUR: return 'Livreur';
      default: return 'Utilisateur';
    }
  };
  
  const sidebarClass = isMobileOpen ? "sidebar mobile-open" : "sidebar";
  
  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>
      
      <aside className={sidebarClass}>
        <div className="sidebar-header">
          <h2>Ocean's Water – Admin</h2>
          {userRole && (
            <div className="user-role">{getRoleName(userRole)}</div>
          )}
          {windowWidth <= 768 && (
            <button 
              className="close-sidebar" 
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>
      <ul>
        {links.map(({ path, label }) => (
          <li key={path}>
            <NavLink
              to={path}
              end
              className={({ isActive }) => isActive ? "active" : ""}
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button 
            onClick={handleLogout} 
            className="logout-link"
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
              width: '100%'
            }}
          >
            🚪 Déconnexion
          </button>
        </li>
      </ul>
    </aside>
    {/* Overlay pour fermer la sidebar sur mobile */}
    {isMobileOpen && (
      <div className="sidebar-overlay" onClick={toggleSidebar}></div>
    )}
    </>
  );
}
