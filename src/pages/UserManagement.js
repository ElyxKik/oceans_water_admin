import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';

// Styles pour la page UserManagement
const styles = {
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#7f8c8d'
  },
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    margin: '20px 0'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2c3e50'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  searchFilters: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    flex: '1'
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    flex: '1',
    minWidth: '200px'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    minWidth: '150px'
  },
  addButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formContainer: {
    marginBottom: '2rem',
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  formTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#2c3e50'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#34495e'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#ffecec',
    color: '#e74c3c',
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#7f8c8d',
    fontSize: '16px'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  th: {
    textAlign: 'left',
    padding: '12px 15px',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  tr: {
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '12px 15px',
    verticalAlign: 'middle'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  editButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '5px',
    borderRadius: '4px',
    color: '#f39c12',
    transition: 'background-color 0.2s'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '5px',
    borderRadius: '4px',
    color: '#e74c3c',
    transition: 'background-color 0.2s'
  },
  roleBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  roleFondateur: {
    backgroundColor: '#d5f5e3',
    color: '#27ae60'
  },
  roleAdministrateur: {
    backgroundColor: '#e8f8f5',
    color: '#16a085'
  },
  roleManager: {
    backgroundColor: '#ebf5fb',
    color: '#3498db'
  },
  roleGestionnaireVentes: {
    backgroundColor: '#eafaf1',
    color: '#2ecc71'
  },
  roleLivreur: {
    backgroundColor: '#f9ebea',
    color: '#e74c3c'
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // État pour contrôler l'ouverture/fermeture du modal de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // États pour le formulaire de création
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'livreur', // Rôle par défaut
  });
  
  // État pour le modal d'édition (à implémenter plus tard)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Fonction pour ouvrir le modal de création
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  // Fonction pour fermer le modal de création
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    // Réinitialiser le formulaire
    setNewUser({ username: '', email: '', password: '', role: 'livreur' });
  };

  // Liste des rôles administratifs (excluant le rôle 'client')
  const ROLES = [
    'fondateur',
    'administrateur',
    'manager',
    'gestionnaire_ventes',
    'livreur',
  ];
  
  // Fonction pour obtenir le style du badge de rôle
  const getRoleBadgeStyle = (role) => {
    const baseStyle = styles.roleBadge;
    
    switch(role) {
      case 'fondateur':
        return { ...baseStyle, ...styles.roleFondateur };
      case 'administrateur':
        return { ...baseStyle, ...styles.roleAdministrateur };
      case 'manager':
        return { ...baseStyle, ...styles.roleManager };
      case 'gestionnaire_ventes':
        return { ...baseStyle, ...styles.roleGestionnaireVentes };
      case 'livreur':
        return { ...baseStyle, ...styles.roleLivreur };
      default:
        return baseStyle;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        // S'assurer que response.data est un tableau
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
          // Si l'API renvoie les données dans un objet avec une propriété results
          setUsers(response.data.results);
        } else {
          // Si la réponse n'est pas un tableau, initialiser un tableau vide
          console.error('Format de réponse inattendu:', response.data);
          setUsers([]);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
          setError('Accès interdit (403) : vous n\'avez pas la permission requise.');
        } else if (status === 401) {
          setError('Non authentifié (401). Veuillez vous reconnecter.');
        } else if (status) {
          setError(`Erreur ${status} lors de la récupération des utilisateurs.`);
        } else {
          setError('Erreur réseau lors de la récupération des utilisateurs.');
        }
        console.error('Erreur détaillée:', err.response ?? err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrer les utilisateurs en fonction de la recherche et du filtre de rôle
  // Exclure les clients de l'affichage
  const filteredUsers = users.filter(user => {
    // Exclure les utilisateurs avec le rôle 'client'
    if (user.role === 'client') {
      return false;
    }
    
    const matchesSearch = searchTerm === '' || 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.createUser(newUser);
      setUsers([...users, response.data]);
      // Fermer le modal et réinitialiser le formulaire
      closeCreateModal();
      alert('Utilisateur créé avec succès !');
    } catch (err) {
      setError('Erreur lors de la création de l’utilisateur.');
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
    // À implémenter plus tard
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        alert('Utilisateur supprimé avec succès !');
      } catch (err) {
        setError('Erreur lors de la suppression de l’utilisateur.');
        console.error(err);
      }
    }
  };

  if (loading) return <div style={styles.loading}>Chargement des utilisateurs...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestion des utilisateurs</h1>
      
      {/* Barre d'outils avec recherche, filtres et bouton pour ouvrir le modal */}
      <div style={styles.toolbar}>
        <div style={styles.searchFilters}>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          <select 
            value={roleFilter} 
            onChange={handleRoleFilterChange}
            style={styles.select}
          >
            <option value="">Tous les rôles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <button onClick={openCreateModal} style={styles.addButton}>
          + Nouvel utilisateur
        </button>
      </div>

      {/* Modal de création d'utilisateur */}
      {isCreateModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Créer un nouvel utilisateur</h3>
              <button onClick={closeCreateModal} style={styles.closeButton}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom d'utilisateur:</label>
                <input 
                  type="text" 
                  name="username" 
                  value={newUser.username} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={newUser.email} 
                  onChange={handleInputChange} 
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mot de passe:</label>
                <input 
                  type="password" 
                  name="password" 
                  value={newUser.password} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rôle:</label>
                <select 
                  name="role" 
                  value={newUser.role} 
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <button type="submit" style={styles.submitButton}>Créer l'utilisateur</button>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <h2 style={styles.title}>Liste des utilisateurs</h2>
      
      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nom d'utilisateur</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={getRoleBadgeStyle(user.role)}>
                      {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button 
                        onClick={() => handleEditUser(user)} 
                        style={styles.editButton}
                        title="Modifier"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        style={styles.deleteButton}
                        title="Supprimer"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
