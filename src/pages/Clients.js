import { useEffect, useState } from 'react';
import clientService from '../services/clientService';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: '20px 0'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2c3e50'
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    flex: '1',
    minWidth: '200px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    border: '1px solid #eee',
    textAlign: 'left'
  },
  td: {
    padding: '10px',
    border: '1px solid #eee'
  },
  error: {
    color: '#e74c3c',
    marginBottom: '10px'
  },
  loading: {
    padding: '20px',
    textAlign: 'center'
  },
  actions: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'flex-end'
  },
  actionButton: {
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    fontSize: '0.85rem'
  },
  viewButton: {
    backgroundColor: '#3498db',
    color: 'white'
  },
  editButton: {
    backgroundColor: '#f39c12',
    color: 'white'
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white'
  },
  activateButton: {
    backgroundColor: '#27ae60',
    color: 'white'
  },
  modalLabel: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  modalValue: {
    marginBottom: '15px'
  },
  // Styles pour les modals personnalisés
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative'
  },
  modalHeader: {
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    marginBottom: '15px'
  },
  modalFooter: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  formControl: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  formCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500'
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: 'white'
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
    color: 'white'
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
    color: 'white'
  },
  successButton: {
    backgroundColor: '#2ecc71',
    color: 'white'
  },
  alert: {
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  alertDanger: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  }
};

// Composant Modal personnalisé
const Modal = ({ show, onHide, title, children, footer }) => {
  if (!show) return null;
  
  return (
    <div style={styles.modalOverlay} onClick={onHide}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h4 style={styles.modalTitle}>{title}</h4>
          <button style={styles.modalClose} onClick={onHide}>&times;</button>
        </div>
        <div style={styles.modalBody}>
          {children}
        </div>
        {footer && (
          <div style={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Alert personnalisé
const Alert = ({ variant, children }) => {
  const alertStyle = {
    ...styles.alert,
    ...(variant === 'success' ? styles.alertSuccess : styles.alertDanger)
  };
  
  return <div style={alertStyle}>{children}</div>;
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les modals
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  
  // États pour l'édition
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    is_active: true
  });

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      // Paramètres de recherche
      const params = {};
      if (search) params.search = search;
      
      // Récupérer tous les utilisateurs
      const data = await clientService.getAllClients(1, params);
      
      // Traitement des données
      let fetched = [];
      if (data && data.results) {
        fetched = Array.isArray(data.results) ? data.results : [];
      } else if (Array.isArray(data)) {
        fetched = data;
      }
      
      // Filtrer pour ne garder que les utilisateurs avec le rôle 'client'
      fetched = fetched.filter(user => user.role === 'client');
      
      // Filtrage supplémentaire si recherche
      if (search) {
        const term = search.toLowerCase();
        fetched = fetched.filter(c => {
          return [c.username, c.email, c.first_name, c.last_name]
            .filter(Boolean)
            .some(v => v.toLowerCase().includes(term));
        });
      }
      setClients(fetched);
    } catch (err) {
      console.error('Erreur chargement clients:', err);
      setError('Impossible de charger les clients');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de gestion des actions
  const handleView = (client) => {
    setSelectedClient(client);
    setViewModal(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setEditForm({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      is_active: client.is_active
    });
    setEditModal(true);
  };

  const handleDelete = (client) => {
    setSelectedClient(client);
    setDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await clientService.updateClient(selectedClient.id, editForm);
      setActionSuccess('Client mis à jour avec succès');
      fetchClients(); // Rafraîchir la liste
      setTimeout(() => {
        setEditModal(false);
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du client:', err);
      setActionError('Erreur lors de la mise à jour du client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await clientService.deactivateClient(selectedClient.id);
      setActionSuccess('Client désactivé avec succès');
      fetchClients(); // Rafraîchir la liste
      setTimeout(() => {
        setDeleteModal(false);
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la désactivation du client:', err);
      setActionError('Erreur lors de la désactivation du client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateClient = async (clientId) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await clientService.activateClient(clientId);
      setActionSuccess('Client activé avec succès');
      fetchClients(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de l\'activation du client:', err);
      setActionError('Erreur lors de l\'activation du client');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [search]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Gestion des Clients</h2>
      {error && <div style={styles.error}>{error}</div>}
      {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      <div style={styles.searchRow}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          style={styles.input}
        />
      </div>
      {loading ? (
        <div style={styles.loading}>Chargement…</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Actif</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.id}</td>
                <td style={styles.td}>{clientService.formatClientName(c)}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.is_active ? '✅' : '❌'}</td>
                <td style={{...styles.td, ...styles.actions}}>
                  <button 
                    onClick={() => handleView(c)} 
                    style={{...styles.actionButton, ...styles.viewButton}}
                  >
                    Voir
                  </button>
                  <button 
                    onClick={() => handleEdit(c)} 
                    style={{...styles.actionButton, ...styles.editButton}}
                  >
                    Modifier
                  </button>
                  {c.is_active ? (
                    <button 
                      onClick={() => handleDelete(c)} 
                      style={{...styles.actionButton, ...styles.deleteButton}}
                    >
                      Désactiver
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleActivateClient(c.id)} 
                      style={{...styles.actionButton, ...styles.activateButton}}
                    >
                      Activer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de visualisation */}
      <Modal 
        show={viewModal} 
        onHide={() => setViewModal(false)} 
        title="Détails du client"
        footer={
          <button 
            style={{...styles.button, ...styles.secondaryButton}} 
            onClick={() => setViewModal(false)}
          >
            Fermer
          </button>
        }
      >
        {selectedClient && (
          <div>
            <div>
              <p style={styles.modalLabel}>ID:</p>
              <p style={styles.modalValue}>{selectedClient.id}</p>
            </div>
            <div>
              <p style={styles.modalLabel}>Nom d'utilisateur:</p>
              <p style={styles.modalValue}>{selectedClient.username}</p>
            </div>
            <div>
              <p style={styles.modalLabel}>Nom complet:</p>
              <p style={styles.modalValue}>{clientService.formatClientName(selectedClient)}</p>
            </div>
            <div>
              <p style={styles.modalLabel}>Email:</p>
              <p style={styles.modalValue}>{selectedClient.email}</p>
            </div>
            <div>
              <p style={styles.modalLabel}>Statut:</p>
              <p style={styles.modalValue}>{selectedClient.is_active ? 'Actif' : 'Inactif'}</p>
            </div>
            <div>
              <p style={styles.modalLabel}>Date d'inscription:</p>
              <p style={styles.modalValue}>{new Date(selectedClient.date_joined).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de modification */}
      <Modal 
        show={editModal} 
        onHide={() => setEditModal(false)} 
        title="Modifier le client"
      >
        {actionError && <Alert variant="danger">{actionError}</Alert>}
        {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}
        
        <form onSubmit={handleEditSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Prénom</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={editForm.first_name} 
              onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Nom</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={editForm.last_name} 
              onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input 
              type="email" 
              style={styles.formControl}
              value={editForm.email} 
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            />
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.formCheck}>
              <input 
                type="checkbox" 
                id="is_active"
                checked={editForm.is_active} 
                onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
              />
              <label htmlFor="is_active">Actif</label>
            </div>
          </div>
          
          <div style={styles.modalFooter}>
            <button 
              type="button" 
              style={{...styles.button, ...styles.secondaryButton}} 
              onClick={() => setEditModal(false)}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              style={{...styles.button, ...styles.primaryButton}} 
              disabled={actionLoading}
            >
              {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de suppression */}
      <Modal 
        show={deleteModal} 
        onHide={() => setDeleteModal(false)} 
        title="Désactiver le client"
      >
        {actionError && <Alert variant="danger">{actionError}</Alert>}
        {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}
        
        {selectedClient && (
          <p>Êtes-vous sûr de vouloir désactiver le client {clientService.formatClientName(selectedClient)} ?</p>
        )}
        
        <div style={styles.modalFooter}>
          <button 
            style={{...styles.button, ...styles.secondaryButton}} 
            onClick={() => setDeleteModal(false)}
          >
            Annuler
          </button>
          <button 
            style={{...styles.button, ...styles.dangerButton}} 
            onClick={handleDeleteConfirm} 
            disabled={actionLoading}
          >
            {actionLoading ? 'Désactivation...' : 'Désactiver'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
