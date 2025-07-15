import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import authService from '../services/authService';

// Définition des rôles et leurs permissions
export const ROLES = {
  FONDATEUR: 'fondateur',
  ADMINISTRATEUR: 'administrateur',
  MANAGER: 'manager',
  GESTIONNAIRE_VENTES: 'gestionnaire_ventes',
  LIVREUR: 'livreur'
};

// Définition des permissions par fonctionnalité
export const PERMISSIONS = {
  // Gestion des utilisateurs
  MANAGE_ALL_USERS: 'manage_all_users',
  MANAGE_STAFF: 'manage_staff',
  VIEW_USERS: 'view_users',
  
  // Gestion des produits
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_PRODUCTS: 'view_products',
  
  // Gestion des stocks
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_INVENTORY: 'view_inventory',
  
  // Gestion des commandes
  MANAGE_ALL_ORDERS: 'manage_all_orders',
  MANAGE_ASSIGNED_ORDERS: 'manage_assigned_orders',
  VIEW_ALL_ORDERS: 'view_all_orders',
  VIEW_ASSIGNED_ORDERS: 'view_assigned_orders',
  PREPARE_ORDERS: 'prepare_orders',
  
  // Gestion des clients
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_CLIENT_DETAILS: 'view_client_details',
  VIEW_CLIENT_BASIC_INFO: 'view_client_basic_info',
  
  // Statistiques et rapports
  VIEW_ALL_STATS: 'view_all_stats',
  VIEW_SALES_STATS: 'view_sales_stats',
  EXPORT_DATA: 'export_data',
  
  // Paramètres système
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  
  // Opérations financières
  MANAGE_REFUNDS: 'manage_refunds',
  APPROVE_REFUNDS: 'approve_refunds',
  REGISTER_MANUAL_SALES: 'register_manual_sales',
  
  // Promotions
  MANAGE_PROMOTIONS: 'manage_promotions',
  VIEW_PROMOTIONS: 'view_promotions',
  
  // Journaux d'activité
  VIEW_ALL_LOGS: 'view_all_logs',
  MANAGE_USERS: 'manage_users',
  VIEW_OWN_LOGS: 'view_own_logs'
};

// Mapping des rôles aux permissions
const rolePermissions = {
  [ROLES.FONDATEUR]: [
    ...Object.values(PERMISSIONS) // Le fondateur a toutes les permissions
  ],
  [ROLES.ADMINISTRATEUR]: [
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_ALL_ORDERS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.VIEW_ALL_STATS,
    PERMISSIONS.VIEW_SALES_STATS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_REFUNDS,
    PERMISSIONS.APPROVE_REFUNDS,
    PERMISSIONS.VIEW_ALL_LOGS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_ALL_ORDERS,
    PERMISSIONS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.VIEW_SALES_STATS,
    PERMISSIONS.APPROVE_REFUNDS,
    PERMISSIONS.VIEW_OWN_LOGS
  ],
  [ROLES.GESTIONNAIRE_VENTES]: [
    // Gestion des produits
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_PRODUCTS,
    
    // Gestion des stocks
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    
    // Gestion des commandes
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.PREPARE_ORDERS,
    
    // Ventes manuelles
    PERMISSIONS.REGISTER_MANUAL_SALES,
    
    // Promotions
    PERMISSIONS.MANAGE_PROMOTIONS,
    PERMISSIONS.VIEW_PROMOTIONS,
    
    // Statistiques
    PERMISSIONS.VIEW_SALES_STATS,
    
    // Logs
    PERMISSIONS.VIEW_OWN_LOGS
  ],
  [ROLES.LIVREUR]: [
    PERMISSIONS.VIEW_ASSIGNED_ORDERS,
    PERMISSIONS.MANAGE_ASSIGNED_ORDERS,
    PERMISSIONS.VIEW_CLIENT_BASIC_INFO,
    PERMISSIONS.VIEW_OWN_LOGS
  ]
};

// Création du contexte de rôle
const RoleContext = createContext();

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState(null);
  
  // Déterminer le rôle de l'utilisateur en fonction des données d'authentification
  useEffect(() => {
    if (currentUser) {
      // Utiliser le service d'authentification pour déterminer le rôle
      const role = authService.getUserRole();
      
      // Mapper le rôle string au rôle enum
      switch(role) {
        case 'fondateur':
          setUserRole(ROLES.FONDATEUR);
          break;
        case 'administrateur':
          setUserRole(ROLES.ADMINISTRATEUR);
          break;
        case 'manager':
          setUserRole(ROLES.MANAGER);
          break;
        case 'gestionnaire_ventes':
          setUserRole(ROLES.GESTIONNAIRE_VENTES);
          break;
        case 'livreur':
          setUserRole(ROLES.LIVREUR);
          break;
        default:
          // Par défaut, si le rôle n'est pas reconnu mais l'utilisateur est connecté
          setUserRole(ROLES.GESTIONNAIRE);
      }
    } else {
      setUserRole(null);
    }
  }, [currentUser]);
  
  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.includes(permission) || false;
  };
  
  // Vérifier si l'utilisateur a un rôle spécifique ou supérieur
  const hasRole = (role) => {
    const roleHierarchy = [
      ROLES.LIVREUR,
      ROLES.GESTIONNAIRE,
      ROLES.MANAGER,
      ROLES.ADMINISTRATEUR,
      ROLES.FONDATEUR
    ];
    
    if (!userRole) return false;
    
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  };
  
  // Valeur du contexte
  const value = {
    userRole,
    hasPermission,
    hasRole,
    ROLES,
    PERMISSIONS
  };
  
  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext;
