import React, { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';
import productService from '../services/productService';

// Helpers - fonctions utilitaires
const formatDate = dateString => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? '#FFD700' : '#D3D3D3', marginRight: '2px' }}>
        ★
      </span>
    );
  }
  return stars;
};

const Reviews = () => {
  /* ------------------------------------------------------------------
   * State hooks
   * ------------------------------------------------------------------ */
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtres & recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  /* ------------------------------------------------------------------
   * Effects – fetch reviews when component mounts or dependencies change
   * ------------------------------------------------------------------ */

  // Charger les avis depuis l'API backend
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (approvalFilter === 'approved') filters.approuve = true;
      if (approvalFilter === 'pending') filters.approuve = false;

      // Définir la taille de page
      const pageSize = 20;
      filters.page_size = pageSize;
      
      const data = await reviewService.getAllReviews(currentPage, filters);
      const list = data.results || data;
      setReviews(list);
      
      setTotalPages(Math.max(1, Math.ceil((data.count || list.length) / pageSize)));
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
      setError('Impossible de charger les avis. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les produits pour afficher les noms
  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data.results || data);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, approvalFilter]);

  /* ------------------------------------------------------------------
   * Handlers – open/close modals, pagination, filters, approval
   * ------------------------------------------------------------------ */
  const handleOpenViewModal = (review) => {
    setSelectedReview(review);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedReview(null);
    setIsViewModalOpen(false);
  };

  // Approuver ou désapprouver un avis
  const handleApprovalToggle = async (reviewId, currentStatus) => {
    setLoading(true);
    try {
      await reviewService.updateReviewApproval(reviewId, !currentStatus);
      // Rafraîchir la liste des avis
      fetchReviews();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      alert('Erreur lors de la mise à jour du statut de l\'avis.');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
    
    setLoading(true);
    try {
      await reviewService.deleteReview(reviewId);
      // Rafraîchir la liste des avis
      fetchReviews();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de l\'avis.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination change
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* ------------------------------------------------------------------
   * Render helpers
   * ------------------------------------------------------------------ */
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.nom || product.name : 'Produit inconnu';
  };

  const renderReviewsTable = () => {
    if (reviews.length === 0) {
      return <div style={styles.tablePlaceholder}>Aucun avis trouvé.</div>;
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Produit</th>
              <th style={styles.th}>Utilisateur</th>
              <th style={styles.th}>Note</th>
              <th style={styles.th}>Commentaire</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id} style={styles.tr}>
                <td style={styles.td}>{review.id}</td>
                <td style={styles.td}>{formatDate(review.date_creation)}</td>
                <td style={styles.td}>{getProductName(review.produit)}</td>
                <td style={styles.td}>
                  {review.utilisateur_nom_complet || review.utilisateur_username || 'Anonyme'}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex' }}>
                    {renderStars(review.note)}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {review.commentaire}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{ 
                    ...styles.statusBadge, 
                    backgroundColor: review.approuve ? '#dcfce7' : '#fef3c7',
                    color: review.approuve ? '#166534' : '#92400e'
                  }}>
                    {review.approuve ? 'Approuvé' : 'En attente'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button style={styles.viewButton} onClick={() => handleOpenViewModal(review)}>
                      Voir
                    </button>
                    <button 
                      style={review.approuve ? styles.dangerButton : styles.approveButton} 
                      onClick={() => handleApprovalToggle(review.id, review.approuve)}
                    >
                      {review.approuve ? 'Désapprouver' : 'Approuver'}
                    </button>
                    <button style={styles.dangerButton} onClick={() => handleDeleteReview(review.id)}>
                      Supprimer
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

  /* ------------------------------------------------------------------
   * Main render
   * ------------------------------------------------------------------ */
  return (
    <section style={styles.container}>
      {/* Header */}
      <h1 style={styles.title}>⭐ Avis & Commentaires</h1>

      {/* Toolbar – search, filters */}
      <div style={styles.toolbar}>
        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher un avis…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        {/* Approval filter */}
        <select
          value={approvalFilter}
          onChange={e => setApprovalFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Tous les statuts</option>
          <option value="approved">Approuvés</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      {/* Error message */}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Content */}
      {loading ? (
        <div style={styles.loadingMessage}>Chargement des avis...</div>
      ) : (
        renderReviewsTable()
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* View Review Modal */}
      {isViewModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>Détails de l'avis #{selectedReview?.id}</h2>
              <button onClick={handleCloseViewModal} style={styles.closeButton}>&times;</button>
            </div>

            <div style={styles.detailSection}>
              <h3>Informations générales</h3>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Produit :</span>{' '}
                <span style={styles.detailValue}>{getProductName(selectedReview?.produit)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Utilisateur :</span>{' '}
                <span style={styles.detailValue}>
                  {selectedReview?.utilisateur_nom_complet || selectedReview?.utilisateur_username || 'Anonyme'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Date de création :</span>{' '}
                <span style={styles.detailValue}>{formatDate(selectedReview?.date_creation)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Dernière modification :</span>{' '}
                <span style={styles.detailValue}>{formatDate(selectedReview?.date_modification)}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Statut :</span>{' '}
                <span style={{ 
                  ...styles.statusBadge, 
                  backgroundColor: selectedReview?.approuve ? '#dcfce7' : '#fef3c7',
                  color: selectedReview?.approuve ? '#166534' : '#92400e'
                }}>
                  {selectedReview?.approuve ? 'Approuvé' : 'En attente'}
                </span>
              </div>
            </div>

            <div style={styles.detailSection}>
              <h3>Évaluation</h3>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Note :</span>{' '}
                <span style={styles.detailValue}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderStars(selectedReview?.note)}
                    <span style={{ marginLeft: '8px' }}>{selectedReview?.note}/5</span>
                  </div>
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Commentaire :</span>{' '}
                <div style={{ ...styles.detailValue, marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {selectedReview?.commentaire}
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                onClick={() => {
                  handleApprovalToggle(selectedReview.id, selectedReview.approuve);
                  handleCloseViewModal();
                }} 
                style={selectedReview?.approuve ? styles.dangerButton : styles.approveButton}
              >
                {selectedReview?.approuve ? 'Désapprouver' : 'Approuver'}
              </button>
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

/* ----------------------------------------------------------------------
 * Inline styles
 * ---------------------------------------------------------------------- */
const styles = {
  container: {
    padding: '20px',
    maxWidth: '100%',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#111827',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    minWidth: '250px',
    fontSize: '14px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #e5e7eb',
    color: '#374151',
    fontWeight: '600',
    backgroundColor: '#f9fafb',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    color: '#4b5563',
    verticalAlign: 'middle',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  approveButton: {
    padding: '6px 12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  dangerButton: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  pageButton: {
    padding: '6px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  errorMessage: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  loadingMessage: {
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
  },
  tablePlaceholder: {
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
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
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
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
    marginBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '16px',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  detailSection: {
    marginBottom: '24px',
  },
  detailItem: {
    marginBottom: '8px',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  detailValue: {
    color: '#4b5563',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px',
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default Reviews;
