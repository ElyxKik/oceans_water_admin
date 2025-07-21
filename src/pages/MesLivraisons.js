import React, { useState, useEffect } from 'react';
import deliveryService from '../services/deliveryService';
import { useAuth } from '../contexts/AuthContext';

// Helpers - fonctions utilitaires
const formatPrice = price => {
  if (price === undefined || price === null || isNaN(price)) return '0 CDF';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = dateString => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const translateDeliveryStatus = status => {
  switch (status) {
    case 'assignee':
      return 'Assignée';
    case 'en_cours':
      return 'En cours';
    case 'livree':
      return 'Livrée';
    case 'echec':
      return 'Échec de livraison';
    case 'reportee':
      return 'Reportée';
    default:
      return status;
  }
};

const getDeliveryStatusStyle = status => {
  switch (status) {
    case 'assignee':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'en_cours':
      return { backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'livree':
      return { backgroundColor: '#dcfce7', color: '#166534' };
    case 'echec':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    case 'reportee':
      return { backgroundColor: '#f3e8ff', color: '#7c3aed' };
    default:
      return { backgroundColor: '#e5e7eb', color: '#4b5563' };
  }
};

const MesLivraisons = () => {
  // États
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(false);

  const { currentUser } = useAuth();

  // Charger les livraisons
  const fetchDeliveries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await deliveryService.getMyDeliveries();
      
      // S'assurer que response.data est un tableau
      if (response.data && Array.isArray(response.data)) {
        setDeliveries(response.data);
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        setDeliveries(response.data.results);
        // Gérer la pagination si elle existe
        if (response.data.count) {
          const itemsPerPage = response.data.results.length;
          setTotalPages(Math.ceil(response.data.count / itemsPerPage));
        }
      } else {
        setDeliveries([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des livraisons:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('Accès interdit : vous devez être livreur pour accéder à cette page.');
      } else if (status === 401) {
        setError('Non authentifié. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des livraisons.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [currentPage]);

  // Filtrer les livraisons
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = !searchQuery || 
      (delivery.commande?.numero_commande && delivery.commande.numero_commande.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.commande?.client?.username && delivery.commande.client.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.commande?.nom_complet && delivery.commande.nom_complet.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || delivery.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Ouvrir le modal de détail
  const handleOpenViewModal = async (delivery) => {
    setLoading(true);
    try {
      const response = await deliveryService.getDeliveryDetails(delivery.id);
      setSelectedDelivery(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      alert('Impossible de charger les détails de la livraison.');
    } finally {
      setLoading(false);
    }
  };

  // Fermer le modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedDelivery(null);
  };

  // Démarrer une livraison
  const handleStartDelivery = async (deliveryId) => {
    setUpdating(true);
    try {
      // Afficher les informations de l'utilisateur connecté
      const currentUser = JSON.parse(localStorage.getItem('admin_user'));
      console.log('Utilisateur connecté:', currentUser);
      console.log('ID utilisateur:', currentUser?.id);
      console.log('Rôle utilisateur:', currentUser?.role);
      console.log('Tentative de démarrage de la livraison ID:', deliveryId);
      
      // Trouver la livraison dans la liste pour vérifier
      const targetDelivery = deliveries.find(d => d.id === deliveryId);
      console.log('Livraison à démarrer:', targetDelivery);
      console.log('Livreur assigné:', targetDelivery?.livreur);
      
      const response = await deliveryService.startDelivery(deliveryId);
      console.log('Réponse API:', response.data);
      
      // Mettre à jour la liste des livraisons
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? response.data
          : delivery
      ));
      
      // Mettre à jour la livraison sélectionnée si elle est ouverte
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(response.data);
      }
      
      alert('Livraison démarrée avec succès !');
    } catch (err) {
      console.error('Erreur lors du démarrage de la livraison:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      console.error('Status de l\'erreur:', err.response?.status);
      alert(`Erreur lors du démarrage de la livraison: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Confirmer une livraison
  const handleConfirmDelivery = async (deliveryId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir confirmer cette livraison ?')) {
      return;
    }
    
    setUpdating(true);
    try {
      const response = await deliveryService.completeDelivery(deliveryId);
      
      // Mettre à jour la liste des livraisons
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? response.data
          : delivery
      ));
      
      // Mettre à jour la livraison sélectionnée si elle est ouverte
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(response.data);
      }
      
      alert('Livraison confirmée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la confirmation de la livraison:', err);
      alert('Erreur lors de la confirmation de la livraison.');
    } finally {
      setUpdating(false);
    }
  };

  // Signaler un problème
  const handleReportIssue = async (deliveryId) => {
    const reason = prompt('Veuillez indiquer la raison du problème :');
    if (!reason) return;
    
    setUpdating(true);
    try {
      console.log('Signalement de problème pour la livraison ID:', deliveryId);
      
      // Vérifier que l'ID est bien défini
      if (!deliveryId) {
        throw new Error('ID de livraison non défini');
      }
      
      const response = await deliveryService.reportDeliveryIssue(deliveryId, { reason });
      
      // Mettre à jour la liste des livraisons
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? response.data
          : delivery
      ));
      
      // Mettre à jour la livraison sélectionnée si elle est ouverte
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(response.data);
      }
      
      alert('Problème signalé avec succès.');
    } catch (err) {
      console.error('Erreur lors du signalement:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      console.error('Status de l\'erreur:', err.response?.status);
      alert(`Erreur lors du signalement du problème: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Pagination
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Rendu du tableau des livraisons
  const renderDeliveriesTable = () => {
    if (filteredDeliveries.length === 0) {
      return <div style={styles.tablePlaceholder}>Aucune livraison trouvée.</div>;
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>N° Commande</th>
              <th style={styles.th}>Date Assignation</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Adresse</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map(delivery => (
              <tr key={delivery.id} style={styles.tr}>
                <td style={styles.td}>
                  {delivery.commande?.numero_commande || delivery.commande?.code || delivery.commande?.id}
                </td>
                <td style={styles.td}>
                  {formatDate(delivery.date_assignation || delivery.created_at)}
                </td>
                <td style={styles.td}>
                  {delivery.commande?.nom_complet || 
                    (delivery.commande?.client && (delivery.commande.client.full_name || delivery.commande.client.username)) || 
                    'Client Anonyme'}
                </td>
                <td style={styles.td}>
                  {delivery.commande?.adresse_livraison || delivery.commande?.shipping_address || '—'}
                </td>
                <td style={styles.td}>
                  {formatPrice(delivery.commande?.total_commande || delivery.commande?.montant_total || delivery.commande?.total)}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...getDeliveryStatusStyle(delivery.statut) }}>
                    {translateDeliveryStatus(delivery.statut)}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button style={styles.viewButton} onClick={() => handleOpenViewModal(delivery)}>
                      Voir
                    </button>
                    {delivery.statut === 'assignee' && (
                      <button 
                        style={styles.primaryButton} 
                        onClick={() => handleStartDelivery(delivery.id)}
                        disabled={updating}
                      >
                        Commencer
                      </button>
                    )}
                    {delivery.statut === 'en_cours' && (
                      <>
                        <button 
                          style={styles.successButton} 
                          onClick={() => handleConfirmDelivery(delivery.id)}
                          disabled={updating}
                        >
                          Confirmer
                        </button>
                        <button 
                          style={styles.dangerButton} 
                          onClick={() => handleReportIssue(delivery.id)}
                          disabled={updating}
                        >
                          Problème
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Rendu de la pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div style={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={styles.pageButton}
        >
          ←
        </button>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={
              page === currentPage
                ? { ...styles.pageButton, ...styles.pageButtonActive }
                : styles.pageButton
            }
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={styles.pageButton}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <section style={styles.container}>
      {/* Header */}
      <h1 style={styles.title}>Liste des livraisons</h1>
      
      {currentUser && (
        <p style={styles.subtitle}>
          Bienvenue {currentUser.first_name || currentUser.username}, voici vos livraisons assignées.
        </p>
      )}

      {/* Toolbar – search, filters */}
      <div style={styles.toolbar}>
        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher une livraison…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Tous les statuts</option>
          <option value="assignee">Assignée</option>
          <option value="en_cours">En cours</option>
          <option value="livree">Livrée</option>
          <option value="echec">Échec</option>
          <option value="reportee">Reportée</option>
        </select>
      </div>

      {/* Deliveries table */}
      {loading ? (
        <div style={styles.loading}>Chargement…</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : (
        renderDeliveriesTable()
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* View Delivery Modal */}
      {isViewModalOpen && selectedDelivery && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>
                Livraison - Commande n° {selectedDelivery.commande?.numero_commande || selectedDelivery.commande?.code || selectedDelivery.commande?.id}
              </h2>
              <button onClick={handleCloseViewModal} style={styles.closeButton}>&times;</button>
            </div>

            {/* Section informations de livraison */}
            <div style={styles.detailSection}>
              <h3>Informations de livraison</h3>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Statut :</span>
                <span style={{ ...styles.statusBadge, ...getDeliveryStatusStyle(selectedDelivery.statut) }}>
                  {translateDeliveryStatus(selectedDelivery.statut)}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Date d'assignation :</span>
                <span style={styles.detailValue}>{formatDate(selectedDelivery.date_assignation)}</span>
              </div>
              {selectedDelivery.date_livraison && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Date de livraison :</span>
                  <span style={styles.detailValue}>{formatDate(selectedDelivery.date_livraison)}</span>
                </div>
              )}
            </div>

            {/* Section informations client */}
            <div style={styles.detailSection}>
              <h3>Informations client</h3>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Nom :</span>
                <span style={styles.detailValue}>
                  {selectedDelivery.commande?.nom_complet || 
                    (selectedDelivery.commande?.client && (selectedDelivery.commande.client.full_name || selectedDelivery.commande.client.username)) || 
                    'Client Anonyme'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Adresse de livraison :</span>
                <span style={styles.detailValue}>
                  {selectedDelivery.commande?.adresse_livraison || selectedDelivery.commande?.shipping_address || '—'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Téléphone :</span>
                <span style={styles.detailValue}>
                  {selectedDelivery.commande?.telephone_livraison || selectedDelivery.commande?.shipping_phone || '—'}
                </span>
              </div>
            </div>

            {/* Section Articles */}
            <div style={styles.itemsSection}>
              <h3>Articles à livrer</h3>
              {selectedDelivery.commande?.articles && selectedDelivery.commande.articles.length > 0 ? (
                <table style={{ ...styles.table, marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Produit</th>
                      <th style={styles.th}>Quantité</th>
                      <th style={styles.th}>Prix unitaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDelivery.commande.articles.map((item, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{item.nom_produit || item.product_name}</td>
                        <td style={styles.td}>{item.quantite || item.quantity}</td>
                        <td style={styles.td}>{formatPrice(item.prix_unitaire || item.unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun article</p>
              )}
            </div>

            {/* Total */}
            <div style={styles.detailSection}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Total à encaisser :</span>
                <span style={{ ...styles.detailValue, fontWeight: 'bold', fontSize: '16px' }}>
                  {formatPrice(selectedDelivery.commande?.total_commande || selectedDelivery.commande?.montant_total || selectedDelivery.commande?.total)}
                </span>
              </div>
            </div>

            {/* Actions dans le modal */}
            <div style={styles.modalActions}>
              {selectedDelivery.statut === 'assignee' && (
                <button 
                  style={styles.primaryButton} 
                  onClick={() => handleStartDelivery(selectedDelivery.id)}
                  disabled={updating}
                >
                  Commencer la livraison
                </button>
              )}
              {selectedDelivery.statut === 'en_cours' && (
                <>
                  <button 
                    style={styles.successButton} 
                    onClick={() => handleConfirmDelivery(selectedDelivery.id)}
                    disabled={updating}
                  >
                    Confirmer la livraison
                  </button>
                  <button 
                    style={styles.dangerButton} 
                    onClick={() => handleReportIssue(selectedDelivery.id)}
                    disabled={updating}
                  >
                    Signaler un problème
                  </button>
                </>
              )}
              <button onClick={handleCloseViewModal} style={styles.secondaryButton}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MesLivraisons;

// Styles - identiques à ceux d'Orders.js
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: '20px',
    color: '#6b7280',
    fontSize: '14px',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  select: {
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
  },
  successButton: {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px 0',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    padding: '20px',
  },
  tablePlaceholder: {
    border: '1px dashed #ccc',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '6px',
  },
  
  /* Table */
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
  },
  tr: {
    backgroundColor: '#fff',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },

  /* Pagination */
  pagination: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
  },
  pageButton: {
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  pageButtonActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: '1px solid #2563eb',
  },

  /* Modal */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    paddingTop: '50px',
    paddingBottom: '50px',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '6px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    lineHeight: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    position: 'absolute',
    top: '10px',
    right: '15px',
  },
  detailSection: {
    marginBottom: '20px',
  },
  detailItem: {
    marginBottom: '8px',
  },
  detailLabel: {
    fontWeight: '600',
    marginRight: '4px',
  },
  detailValue: {},
  itemsSection: {
    marginTop: '10px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
};
