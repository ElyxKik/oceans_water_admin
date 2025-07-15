import React from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';

const AccessDenied = () => {
  const { userRole } = useRole();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      height: 'calc(100vh - 200px)',
    },
    icon: {
      fontSize: '5rem',
      color: '#ef4444',
      marginBottom: '1rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#111827',
    },
    message: {
      fontSize: '1.1rem',
      marginBottom: '2rem',
      maxWidth: '600px',
      color: '#4b5563',
    },
    role: {
      fontWeight: 'bold',
      color: '#0c4a6e',
    },
    button: {
      backgroundColor: '#0c4a6e',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      display: 'inline-block',
      marginTop: '1rem',
    },
    contactLink: {
      color: '#0c4a6e',
      textDecoration: 'underline',
      marginTop: '1rem',
      display: 'inline-block',
    }
  };

  // Fonction pour obtenir le nom du rôle en français
  const getRoleName = (role) => {
    switch (role) {
      case 'fondateur': return 'Fondateur';
      case 'administrateur': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'gestionnaire': return 'Gestionnaire de ventes';
      case 'livreur': return 'Livreur';
      default: return 'Utilisateur';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>🔒</div>
      <h1 style={styles.title}>Accès refusé</h1>
      <p style={styles.message}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        {userRole && (
          <> Votre rôle actuel est <span style={styles.role}>{getRoleName(userRole)}</span>.</>
        )}
      </p>
      <p style={styles.message}>
        Si vous pensez qu'il s'agit d'une erreur ou si vous avez besoin d'un accès supplémentaire,
        veuillez contacter l'administrateur système.
      </p>
      <Link to="/" style={styles.button}>
        Retour au tableau de bord
      </Link>
      <a href="mailto:admin@oceanswater.com" style={styles.contactLink}>
        Contacter l'administrateur
      </a>
    </div>
  );
};

export default AccessDenied;
