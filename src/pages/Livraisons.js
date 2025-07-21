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

const Livraisons = () => {
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const { currentUser } = useAuth();

  // Charger toutes les livraisons
  const fetchDeliveries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await deliveryService.getAllDeliveries(currentPage, itemsPerPage);
      
      // S'assurer que response.data est un tableau
      if (response.data && Array.isArray(response.data)) {
        setDeliveries(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        setDeliveries(response.data.results);
        // Gérer la pagination si elle existe
        if (response.data.count) {
          setTotalItems(response.data.count);
          setTotalPages(Math.ceil(response.data.count / itemsPerPage));
        }
      } else {
        setDeliveries([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des livraisons:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('Accès interdit : vous devez être administrateur ou fondateur pour accéder à cette page.');
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
  }, [currentPage, itemsPerPage]);

  // Filtrer les livraisons
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = !searchQuery || 
      (delivery.commande?.numero_commande && delivery.commande.numero_commande.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.commande?.client?.username && delivery.commande.client.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.commande?.nom_complet && delivery.commande.nom_complet.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.livreur_username && delivery.livreur_username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.livreur?.full_name && delivery.livreur.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
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

  // Pagination
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Changer le nombre d'éléments par page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Revenir à la première page
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
              <th style={styles.th}>Livreur</th>
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
                  {delivery.livreur_username || 'Non assigné'}
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

    // Calculer les pages à afficher
    let pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si leur nombre est inférieur à maxVisiblePages
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Afficher un sous-ensemble de pages avec ellipsis
      if (currentPage <= 3) {
        // Près du début
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        // Près de la fin
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        // Au milieu
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return (
      <div style={styles.paginationContainer}>
        <div style={styles.itemsPerPageSelector}>
          <span>Éléments par page: </span>
          <select 
            value={itemsPerPage} 
            onChange={handleItemsPerPageChange}
            style={styles.select}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <div style={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            ←
          </button>
          
          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} style={styles.ellipsis}>...</span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(page)}
                style={
                  page === currentPage
                    ? { ...styles.pageButton, ...styles.pageButtonActive }
                    : styles.pageButton
                }
              >
                {page}
              </button>
            )
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            →
          </button>
        </div>
        
        <div style={styles.paginationInfo}>
          Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} livraisons
        </div>
      </div>
    );
  };

  return (
    <section style={styles.container}>
      {/* Header */}
      <h1 style={styles.title}>Gestion des livraisons</h1>
      
      <p style={styles.subtitle}>
        Vue d'ensemble de toutes les livraisons de la plateforme.
      </p>

      {/* Toolbar – search, filters */}
      <div style={styles.toolbar}>
        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher par commande, client ou livreur..."
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
                <span style={styles.detailLabel}>Livreur assigné :</span>
                <span style={styles.detailValue}>
                  {selectedDelivery.livreur_username || 'Non assigné'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Date d'assignation :</span>
                <span style={styles.detailValue}>{formatDate(selectedDelivery.date_assignation)}</span>
              </div>
              {selectedDelivery.date_debut_livraison && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Date de début :</span>
                  <span style={styles.detailValue}>{formatDate(selectedDelivery.date_debut_livraison)}</span>
                </div>
              )}
              {selectedDelivery.date_livraison && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Date de livraison :</span>
                  <span style={styles.detailValue}>{formatDate(selectedDelivery.date_livraison)}</span>
                </div>
              )}
              {selectedDelivery.notes_livreur && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Notes du livreur :</span>
                  <span style={styles.detailValue}>{selectedDelivery.notes_livreur}</span>
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
                      <tr key={`item-${item.id || item.product_id || item.nom_produit}-${idx}`} style={styles.tr}>
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

// Styles - inspirés de Orders.js
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#4b5563',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  successButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    borderRadius: '4px',
  },
  tablePlaceholder: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  pagination: {
    display: 'flex',
    gap: '5px',
  },
  pageButton: {
    padding: '5px 10px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  pageButtonActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb',
  },
  ellipsis: {
    padding: '5px',
    color: '#6b7280',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#6b7280',
  },
  itemsPerPageSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#6b7280',
  },
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
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e5e7eb',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  detailSection: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
  },
  detailItem: {
    display: 'flex',
    marginBottom: '8px',
  },
  detailLabel: {
    fontWeight: '500',
    width: '150px',
    color: '#4b5563',
  },
  detailValue: {
    flex: 1,
  },
  itemsSection: {
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
};

export default Livraisons;
