import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import clientService from '../services/clientService';
import productService from '../services/productService';

// Helpers - déplacés au niveau supérieur
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
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const formatAny = val => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
};

const translatePaymentMethod = method => {
  switch (method) {
    case 'a_la_livraison':
      return 'À la livraison';
    case 'especes':
      return 'Espèces';
    case 'carte':
      return 'Carte bancaire';
    case 'mobile_money':
      return 'Mobile Money';
    default:
      return method;
  }
};

const translateStatus = status => {
  switch (status) {
    case 'pending':
    case 'en_attente':
      return 'En attente';
    case 'validated':
    case 'confirmee':
      return 'Validée';
    case 'delivered':
    case 'livree':
      return 'Livrée';
    case 'cancelled':
    case 'annulee':
      return 'Annulée';
    default:
      return status;
  }
};

const getStatusStyle = status => {
  switch (status) {
    case 'pending':
    case 'en_attente':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'validated':
    case 'confirmee':
      return { backgroundColor: '#dcfce7', color: '#166534' };
    case 'delivered':
    case 'livree':
      return { backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'cancelled':
    case 'annulee':
      return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    default:
      return { backgroundColor: '#e5e7eb', color: '#4b5563' };
  }
};

/**
 * OrdersNew
 * A fresh rewrite of Orders.js with the exact same UI/UX & features
 * but rebuilt from scratch to avoid lingering JSX syntax issues.
 *
 * STEP 1 (Skeleton):
 *  - Set up basic state & layout scaffolding
 *  - No business logic is implemented yet – placeholders only
 *  - Subsequent steps will progressively add functionality (fetching,
 *    filtering, pagination, view/edit modal, create modal, etc.)
 */

const OrdersNew = () => {
  /* ------------------------------------------------------------------
   * State hooks – only minimal declarations here; will be fleshed out
   * ------------------------------------------------------------------ */
  const [orders, setOrders] = useState([]);            // Full list of orders
  const [loading, setLoading] = useState(false);       // Global loading flag
  const [error, setError] = useState(null);            // Global error message

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals (view/edit & create)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // Order being viewed/edited

  /* ------------------------------------------------------------------
   * Effects – fetch orders when component mounts or dependencies change
   * ------------------------------------------------------------------ */

  // Charger les commandes depuis l’API backend
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;

      const data = await orderService.getAllOrders(currentPage, filters);
      const list = data.results || data;
      setOrders(list.map(o => ({ ...o, status: o.status || o.statut })));
      setTotalPages(Math.max(1, Math.ceil((data.count || list.length) / 10)));
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter]);

  /* ------------------------------------------------------------------
   * Handlers – open/close modals, pagination, filters (placeholders)
   * ------------------------------------------------------------------ */
  const handleOpenViewModal = async (order) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await orderService.getOrderById(order.id);
      // Harmoniser certains alias pour le frontend
      const normalized = {
        ...detail,
        status: detail.status || detail.statut,
        client: detail.client || order.client, // au cas où
      };
      setSelectedOrder(normalized);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Erreur lors de la récupération du détail de la commande:', err);
      setError("Impossible de charger les détails de la commande.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setSelectedOrder(null);
    setIsViewModalOpen(false);
    setEditMode(false);
    setEditFormData(null);
  };
  
  // Fonction pour gérer l'édition d'une commande
  const handleEditOrder = async (order) => {
    setLoading(true);
    try {
      // Récupérer les détails complets de la commande
      const detail = await orderService.getOrderById(order.id);
      // Harmoniser certains alias pour le frontend
      const normalized = {
        ...detail,
        status: detail.status || detail.statut,
        client: detail.client || order.client,
      };
      setSelectedOrder(normalized);
      
      // Initialiser le formulaire d'édition avec les valeurs actuelles
      setEditFormData({
        status: normalized.status || normalized.statut,
        shipping_address: normalized.adresse_livraison || normalized.shipping_address || '',
        shipping_phone: normalized.telephone_livraison || normalized.shipping_phone || '',
        payment_method: normalized.payment_method || normalized.methode_paiement || 'a_la_livraison',
        notes: normalized.notes || '',
        items: (normalized.articles || normalized.items || []).map(item => ({
          id: item.id,
          product: item.product_id || item.produit_id || item.id_produit,
          product_name: item.product_name || item.nom_produit,
          quantity: item.quantity || item.quantite || 1,
          unit_price: item.unit_price || item.prix_unitaire,
          deposit_price: item.deposit_price || item.prix_consigne || 0
        }))
      });
      
      // Ouvrir le modal d'édition
      setIsViewModalOpen(true);
      // Mettre le modal en mode édition
      setEditMode(true);
    } catch (err) {
      console.error('Erreur lors de la récupération du détail de la commande:', err);
      alert("Impossible de charger les détails de la commande pour édition.");
    } finally {
      setLoading(false);
    }
  };
  
  // État pour suivre si on est en mode édition
  const [editMode, setEditMode] = useState(false);
  // État pour le formulaire d'édition
  const [editFormData, setEditFormData] = useState(null);
  // État pour suivre si une mise à jour est en cours
  const [updating, setUpdating] = useState(false);
  
  // Fonction pour gérer les changements dans le formulaire d'édition
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Fonction pour gérer les changements dans les articles du formulaire d'édition
  const handleEditItemChange = (idx, field, value) => {
    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[idx] = { ...updatedItems[idx], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };
  
  // Fonction pour ajouter une ligne d'article dans le formulaire d'édition
  const addEditItemRow = () => {
    setEditFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, unit_price: 0, deposit_price: 0 }]
    }));
  };
  
  // Fonction pour supprimer une ligne d'article dans le formulaire d'édition
  const removeEditItemRow = (idx) => {
    setEditFormData(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== idx);
      return { ...prev, items: updatedItems };
    });
  };
  
  // Fonction pour enregistrer les modifications
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder || !editFormData) return;
    
    setUpdating(true);
    try {
      // Préparer les données pour l'API
      const payload = {
        statut: editFormData.status,
        adresse_livraison: editFormData.shipping_address,
        telephone_livraison: editFormData.shipping_phone,
        methode_paiement: editFormData.payment_method,
        notes: editFormData.notes,
        // Pour les articles, il faudrait un endpoint spécifique ou une logique backend adaptée
        // Cette partie dépend de l'API backend
      };
      
      await orderService.updateOrder(selectedOrder.id, payload);
      
      // Rafraîchir la liste des commandes
      fetchOrders();
      
      // Fermer le modal et réinitialiser
      setEditMode(false);
      setIsViewModalOpen(false);
      setSelectedOrder(null);
      setEditFormData(null);
      
      alert('La commande a été mise à jour avec succès.');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la commande:', err);
      alert('Impossible de mettre à jour la commande. Veuillez réessayer.');
    } finally {
      setUpdating(false);
    }
  };
  
  // Fonction pour annuler une commande
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }
    
    setLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, 'cancelled');
      // Rafraîchir la liste des commandes
      fetchOrders();
      alert('La commande a été annulée avec succès.');
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la commande:', err);
      alert('Impossible d\'annuler la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // État pour le modal d'assignation de livraison
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [selectedDeliveryUser, setSelectedDeliveryUser] = useState('');
  const [loadingDeliveryUsers, setLoadingDeliveryUsers] = useState(false);
  
  // Fonction pour ouvrir le modal d'assignation de livraison
  const handleAssignDelivery = async (order) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
    
    // Charger les livreurs disponibles
    setLoadingDeliveryUsers(true);
    try {
      // Simuler le chargement des livreurs (à remplacer par un appel API réel)
      const response = await fetch('/api/users?role=livreur');
      if (response.ok) {
        const data = await response.json();
        setDeliveryUsers(data.results || data || []);
      } else {
        throw new Error('Erreur lors du chargement des livreurs');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des livreurs:', err);
      // Données de test en cas d'erreur
      setDeliveryUsers([
        { id: 1, name: 'Jean Dupont', phone: '+243 123456789' },
        { id: 2, name: 'Marie Dubois', phone: '+243 987654321' },
        { id: 3, name: 'Pierre Martin', phone: '+243 456789123' },
      ]);
    } finally {
      setLoadingDeliveryUsers(false);
    }
  };
  
  // Fonction pour fermer le modal d'assignation
  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedOrder(null);
    setSelectedDeliveryUser('');
  };
  
  // Fonction pour assigner un livreur à une commande
  const handleAssignDeliverySubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDeliveryUser) {
      alert('Veuillez sélectionner un livreur.');
      return;
    }
    
    setLoading(true);
    try {
      // Simuler l'assignation (à remplacer par un appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans un cas réel, on ferait un appel API ici
      // await orderService.assignDelivery(selectedOrder.id, selectedDeliveryUser);
      
      // Rafraîchir la liste des commandes
      fetchOrders();
      alert('La commande a été assignée avec succès.');
      handleCloseAssignModal();
    } catch (err) {
      console.error('Erreur lors de l\'assignation de la commande:', err);
      alert('Impossible d\'assigner la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Create order modal handlers ----
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    client: '', // id client
    manual_client: false,
    client_name: '',
    client_email: '',
    client_phone: '',
    items: [{ product: '', quantity: 1 }],
    payment_method: 'a_la_livraison',
    shipping_address: '',
    shipping_phone: '',
    notes: '',
  });

  const fetchClientsAndProducts = async () => {
    try {
      setLoadingClients(true);
      setLoadingProducts(true);
      const [clientsData, productsData] = await Promise.all([
        clientService.getAllClients(1),
        productService.getAllProducts(1),
      ]);
      setClients((clientsData.results || clientsData) || []);
      setProducts((productsData.results || productsData) || []);
    } catch (e) {
      console.error('Erreur chargement clients/produits', e);
    } finally {
      setLoadingClients(false);
      setLoadingProducts(false);
    }
  };

  const handleOpenCreateModal = async () => {
    await fetchClientsAndProducts();
    setIsCreateModalOpen(true);
  };
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewOrder({
      client: '',
      manual_client: false,
      client_name: '',
      client_email: '',
      client_phone: '',
      items: [{ product: '', quantity: 1 }],
      payment_method: 'a_la_livraison',
      shipping_address: '',
      shipping_phone: '',
      notes: '',
    });
  };

  const handleNewOrderField = (field, value) => {
    setNewOrder(prev => ({ ...prev, [field]: value }));
  };
  const toggleManualClient = () => {
    setNewOrder(prev => ({ ...prev, manual_client: !prev.manual_client, client: '' }));
  };
  const handleItemChange = (index, field, value) => {
    setNewOrder(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };
  const addItemRow = () => {
    setNewOrder(prev => ({ ...prev, items: [...prev.items, { product: '', quantity: 1 }] }));
  };
  const removeItemRow = (index) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Construire payload backend
      const payload = {
        ...newOrder,
        items: newOrder.items.filter(it => it.product && it.quantity > 0).map(it => ({ product: it.product, quantity: Number(it.quantity) })),
      };
      if (newOrder.manual_client) {
        payload.client_name = newOrder.client_name;
        payload.client_email = newOrder.client_email;
        payload.client_phone = newOrder.client_phone;
      }
      await orderService.createOrder(payload);
      alert('Commande créée avec succès');
      handleCloseCreateModal();
      fetchOrders();
    } catch (err) {
      console.error('Erreur création commande', err);
      alert('Erreur: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCreating(false);
    }
  };

  // Pagination change
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* ------------------------------------------------------------------
   * Render helpers (placeholders for now)
   * ------------------------------------------------------------------ */
  const renderOrdersTable = () => {
    if (orders.length === 0) {
      return <div style={styles.tablePlaceholder}>Aucune commande trouvée.</div>;
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={styles.tr}>
                <td style={styles.td}>{order.numero_commande || order.code || order.id}</td>
                <td style={styles.td}>{formatDate(order.date_commande || order.created_at)}</td>
                <td style={styles.td}>
                  {order.client_nom ||
                    (order.client && (order.client.full_name || order.client.username || order.client.email)) ||
                    order.client_anonyme ||
                    'Client'}
                </td>
                <td style={styles.td}>{formatPrice(order.total_commande || order.montant_total || order.total)}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                    {translateStatus(order.status)}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button style={styles.viewButton} onClick={() => handleOpenViewModal(order)}>
                      Voir
                    </button>
                    <button 
                       style={styles.editButton} 
                      onClick={() => handleEditOrder(order)}
                      disabled={order.status === 'cancelled' || order.status === 'annulee'}
                    >
                      Modifier
                    </button>
                    {(order.status === 'pending' || order.status === 'en_attente' || order.status === 'validated' || order.status === 'validee') && (
                      <button style={styles.dangerButton} onClick={() => handleCancelOrder(order.id)}>
                        Annuler
                      </button>
                    )}
                    {(order.status === 'validated' || order.status === 'validee' || order.status === 'confirmee') && (
                      <button style={styles.assignButton} onClick={() => handleAssignDelivery(order)}>
                        Assigner
                      </button>
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
      <h1 style={styles.title}>Gestion des commandes</h1>

      {/* Toolbar – search, filters, create button */}
      <div style={styles.toolbar}>
        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher une commande…"
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
          <option value="pending">En attente</option>
          <option value="validated">Validée</option>
          <option value="delivered">Livrée</option>
          <option value="cancelled">Annulée</option>
        </select>

        {/* Create order button */}
        <button onClick={handleOpenCreateModal} style={styles.primaryButton}>
          + Nouvelle commande
        </button>
      </div>

      {/* Orders table */}
      {loading ? (
        <div style={styles.loading}>Chargement…</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : (
        renderOrdersTable()
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* View/Edit Order Modal */}
      {isViewModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>Commande n° {selectedOrder?.numero_commande || selectedOrder?.code || selectedOrder?.id}</h2>
              <button onClick={handleCloseViewModal} style={styles.closeButton}>&times;</button>
            </div>

            {!editMode ? (
              /* Mode visualisation */
              <>
                {/* Section informations principales */}
                <div style={styles.detailSection}>
                  <h3>Détails de la commande</h3>
                  <div style={styles.detailItem}><span style={styles.detailLabel}>Numéro :</span>{' '}<span style={styles.detailValue}>{selectedOrder?.numero_commande || selectedOrder?.code || selectedOrder?.id}</span></div>
                  <div style={styles.detailItem}><span style={styles.detailLabel}>Client :</span>{' '}<span style={styles.detailValue}>{selectedOrder?.client && (selectedOrder.client.full_name || selectedOrder.client.username || selectedOrder.client.email) || selectedOrder?.client_nom || selectedOrder?.client_name || '—'}</span></div>
                  {selectedOrder?.client_anonyme && (
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Client anonyme :</span>{' '}<span style={styles.detailValue}>{selectedOrder.client_anonyme}</span></div>
                  )}
                  <div style={styles.detailItem}><span style={styles.detailLabel}>Statut :</span>{' '}<span style={{ ...styles.statusBadge, ...getStatusStyle(selectedOrder?.status) }}>{translateStatus(selectedOrder?.status)}</span></div>
                  <div style={styles.detailItem}><span style={styles.detailLabel}>Adresse de livraison :</span>{' '}<span style={styles.detailValue}>{selectedOrder?.shipping_address || selectedOrder?.adresse_livraison || '—'}</span></div>
                  <div style={styles.detailItem}><span style={styles.detailLabel}>Téléphone de livraison :</span>{' '}<span style={styles.detailValue}>{selectedOrder?.shipping_phone || selectedOrder?.telephone_livraison || selectedOrder?.phone_livraison || '—'}</span></div>
                  {selectedOrder?.payment_method && (
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Mode de paiement :</span>{' '}<span style={styles.detailValue}>{translatePaymentMethod(selectedOrder.payment_method)}</span></div>
                  )}
                </div>

                {/* Section Articles */}
                <div style={styles.itemsSection}>
                  <h3>Articles de commande</h3>
                  {(Array.isArray(selectedOrder?.items) && selectedOrder.items.length > 0) || (Array.isArray(selectedOrder?.articles) && selectedOrder.articles.length > 0) ? (
                    <table style={{ ...styles.table, marginTop: '10px' }}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Produit</th>
                          <th style={styles.th}>Quantité</th>
                          <th style={styles.th}>Prix unitaire</th>
                          <th style={styles.th}>Prix consigne unitaire</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedOrder?.items || selectedOrder?.articles || []).map((it, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={styles.td}>{it.product_name || it.nom_produit || it.name}</td>
                            <td style={styles.td}>{it.quantity || it.quantite}</td>
                            <td style={styles.td}>{formatPrice(it.unit_price || it.prix_unitaire || it.price)}</td>
                            <td style={styles.td}>{formatPrice(it.deposit_price || it.prix_consigne || it.prix_consigne_unitaire || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Aucun article</p>
                  )}
                </div>

                {/* Totaux */}
                {(() => {
                  const items = (selectedOrder?.items || selectedOrder?.articles || []);
                  const totalProduits = items.reduce((acc, it) => acc + ((it.unit_price || it.prix_unitaire || it.price || 0) * (it.quantity || it.quantite || 1)), 0);
                  const totalConsignes = items.reduce((acc, it) => acc + ((it.deposit_price || it.prix_consigne || it.prix_consigne_unitaire || 0) * (it.quantity || it.quantite || 1)), 0);
                  const totalCommande = selectedOrder?.total_commande || selectedOrder?.montant_total || selectedOrder?.total || (totalProduits + totalConsignes);
                  return (
                    <div style={styles.itemsSection}>
                      <h3>Totaux</h3>
                      <div style={styles.detailItem}><span style={styles.detailLabel}>Total produits :</span>{' '}<span style={styles.detailValue}>{formatPrice(totalProduits)}</span></div>
                      <div style={styles.detailItem}><span style={styles.detailLabel}>Total consignes :</span>{' '}<span style={styles.detailValue}>{formatPrice(totalConsignes)}</span></div>
                      <div style={styles.detailItem}><span style={styles.detailLabel}>Total commande :</span>{' '}<span style={styles.detailValue}>{formatPrice(totalCommande)}</span></div>
                    </div>
                  );
                })()}

                <button onClick={handleCloseViewModal} style={{ ...styles.primaryButton, marginTop: '20px' }}>
                  Fermer
                </button>
              </>
            ) : (
              /* Mode édition */
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Informations client (non modifiables) */}
                <div style={styles.detailSection}>
                  <h3>Informations client</h3>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Client :</span>{' '}
                    <span style={styles.detailValue}>
                      {selectedOrder?.client && (selectedOrder.client.full_name || selectedOrder.client.username || selectedOrder.client.email) || 
                       selectedOrder?.client_nom || selectedOrder?.client_name || '—'}
                    </span>
                  </div>
                  {selectedOrder?.client_anonyme && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Client anonyme :</span>{' '}
                      <span style={styles.detailValue}>{selectedOrder.client_anonyme}</span>
                    </div>
                  )}
                </div>
                
                {/* Statut de la commande */}
                <div style={{...styles.formGroup, width: '100%'}}>
                  <label style={{...styles.label, fontSize: '16px', marginBottom: '8px'}}>Statut</label>
                  <select 
                    value={editFormData?.status || ''} 
                    onChange={(e) => handleEditFormChange('status', e.target.value)}
                    style={{...styles.select, width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                  >
                    <option value="en_attente">En attente</option>
                    <option value="confirmee">Confirmée</option>
                    <option value="en_preparation">En préparation</option>
                    <option value="prete_livraison">Prête pour livraison</option>
                    <option value="en_livraison">En livraison</option>
                    <option value="livree">Livrée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
                
                {/* Adresse & téléphone livraison */}
                <div style={{...styles.formGroup, width: '100%'}}>
                  <label style={{...styles.label, fontSize: '16px', marginBottom: '8px'}}>Adresse de livraison</label>
                  <input
                    type="text"
                    value={editFormData?.shipping_address || ''}
                    onChange={(e) => handleEditFormChange('shipping_address', e.target.value)}
                    required
                    style={{...styles.searchInput, width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                  />
                </div>
                
                <div style={{...styles.formGroup, width: '100%'}}>
                  <label style={{...styles.label, fontSize: '16px', marginBottom: '8px'}}>Téléphone de livraison</label>
                  <input
                    type="text"
                    value={editFormData?.shipping_phone || ''}
                    onChange={(e) => handleEditFormChange('shipping_phone', e.target.value)}
                    required
                    style={{...styles.searchInput, width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                  />
                </div>
                
                {/* Méthode de paiement */}
                <div style={{...styles.formGroup, width: '100%'}}>
                  <label style={{...styles.label, fontSize: '16px', marginBottom: '8px'}}>Mode de paiement</label>
                  <select
                    value={editFormData?.payment_method || ''}
                    onChange={(e) => handleEditFormChange('payment_method', e.target.value)}
                    style={{...styles.select, width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                  >
                    <option value="a_la_livraison">Paiement à la livraison</option>
                    <option value="especes">Espèces</option>
                    <option value="carte">Carte bancaire</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
                
                {/* Notes */}
                <div style={{...styles.formGroup, width: '100%'}}>
                  <label style={{...styles.label, fontSize: '16px', marginBottom: '8px'}}>Notes</label>
                  <textarea
                    value={editFormData?.notes || ''}
                    onChange={(e) => handleEditFormChange('notes', e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
                
                {/* Articles (lecture seule pour l'instant) */}
                <div style={styles.itemsSection}>
                  <h3>Articles de commande</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    La modification des articles n'est pas disponible pour le moment.
                  </p>
                  {editFormData?.items && editFormData.items.length > 0 ? (
                    <table style={{ ...styles.table, marginTop: '10px' }}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Produit</th>
                          <th style={styles.th}>Quantité</th>
                          <th style={styles.th}>Prix unitaire</th>
                          <th style={styles.th}>Prix consigne</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editFormData.items.map((it, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={styles.td}>{it.product_name}</td>
                            <td style={styles.td}>{it.quantity}</td>
                            <td style={styles.td}>{formatPrice(it.unit_price)}</td>
                            <td style={styles.td}>{formatPrice(it.deposit_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Aucun article</p>
                  )}
                </div>
                
                {/* Boutons d'action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', position: 'sticky', bottom: 0, backgroundColor: '#fff', padding: '15px 0', borderTop: '1px solid #eee' }}>
                  <button 
                    type="submit" 
                    disabled={updating} 
                    style={{...styles.primaryButton, padding: '10px 20px', fontSize: '16px', minWidth: '120px'}}
                  >
                    {updating ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCloseViewModal} 
                    style={{...styles.secondaryButton, padding: '10px 20px', fontSize: '16px', minWidth: '120px'}}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Nouvelle commande</h2>

            {loadingClients || loadingProducts ? (
              <p>Chargement des données...</p>
            ) : (
              <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Choix du client */}
                <div>
                  <label>
                    <input type="checkbox" checked={newOrder.manual_client} onChange={toggleManualClient} />
                    Client manuel
                  </label>
                </div>
                {!newOrder.manual_client ? (
                  <select
                    value={newOrder.client}
                    onChange={e => handleNewOrderField('client', e.target.value)}
                    required
                    style={styles.select}
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} - {c.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={newOrder.client_name}
                      onChange={e => handleNewOrderField('client_name', e.target.value)}
                      required
                      style={styles.searchInput}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newOrder.client_email}
                      onChange={e => handleNewOrderField('client_email', e.target.value)}
                      style={styles.searchInput}
                    />
                    <input
                      type="text"
                      placeholder="Téléphone"
                      value={newOrder.client_phone}
                      onChange={e => handleNewOrderField('client_phone', e.target.value)}
                      required
                      style={styles.searchInput}
                    />
                  </>
                )}

                {/* Adresse & téléphone livraison */}
                <input
                  type="text"
                  placeholder="Adresse de livraison"
                  value={newOrder.shipping_address}
                  onChange={e => handleNewOrderField('shipping_address', e.target.value)}
                  required
                  style={styles.searchInput}
                />
                <input
                  type="text"
                  placeholder="Téléphone de livraison"
                  value={newOrder.shipping_phone}
                  onChange={e => handleNewOrderField('shipping_phone', e.target.value)}
                  required
                  style={styles.searchInput}
                />

                {/* Items */}
                <div>
                  <h4>Articles</h4>
                  {(newOrder.items || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <select
                        value={it.product}
                        onChange={e => handleItemChange(idx, 'product', e.target.value)}
                        required
                        style={styles.select}
                      >
                        <option value="">Produit</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name || p.nom}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        style={{ width: '80px', padding: '6px' }}
                        required
                      />
                      {(newOrder.items || []).length > 1 && (
                        <button type="button" onClick={() => removeItemRow(idx)} style={styles.dangerButton}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addItemRow} style={styles.secondaryButton}>
                    + Ajouter un article
                  </button>
                </div>

                {/* Méthode de paiement */}
                <select
                  value={newOrder.payment_method}
                  onChange={e => handleNewOrderField('payment_method', e.target.value)}
                  style={styles.select}
                >
                  <option value="a_la_livraison">Paiement à la livraison</option>
                  <option value="especes">Espèces</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>

                {/* Notes */}
                <textarea
                  placeholder="Notes"
                  value={newOrder.notes}
                  onChange={e => handleNewOrderField('notes', e.target.value)}
                  rows={3}
                  style={{ padding: '8px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', position: 'sticky', bottom: 0, backgroundColor: '#fff', padding: '15px 0', borderTop: '1px solid #eee' }}>
                  <button 
                    type="submit" 
                    style={{...styles.primaryButton, padding: '10px 20px', fontSize: '16px', minWidth: '120px'}} 
                    disabled={creating}
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCloseCreateModal} 
                    style={{...styles.secondaryButton, padding: '10px 20px', fontSize: '16px', minWidth: '120px'}}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Assign Delivery Modal */}
      {isAssignModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Assigner la commande #{selectedOrder?.numero_commande || selectedOrder?.id}</h2>
            {loadingDeliveryUsers ? (
              <p>Chargement des livreurs...</p>
            ) : (
              <form onSubmit={handleAssignDeliverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  value={selectedDeliveryUser}
                  onChange={e => setSelectedDeliveryUser(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">-- Sélectionner un livreur --</option>
                  {deliveryUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.full_name || u.username}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={styles.primaryButton}>Assigner</button>
                  <button type="button" onClick={handleCloseAssignModal} style={styles.secondaryButton}>Annuler</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}; // Fin du composant OrdersNew

export default OrdersNew;

/* ----------------------------------------------------------------------
 * Inline styles – will be expanded/refined in later steps to match Orders.js
 * -------------------------------------------------------------------- */
const styles = {
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    fontSize: '14px',
  },
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '20px',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '8px',
  },
  select: {
    padding: '8px',
  },
  primaryButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px 0',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  tablePlaceholder: {
    border: '1px dashed #ccc',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '6px',
  },
  paginationPlaceholder: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#999',
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

  /* ---- Table ---- */
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
  editButton: {
    backgroundColor: '#d97706',
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
  dangerButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  assignButton: {
    backgroundColor: '#4a6741',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
  },

  /* ---- Pagination ---- */
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
    borderColor: '#2563eb',
  },

  /* ---- Modal detail ---- */
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
};

// Les fonctions utilitaires ont été déplacées au niveau supérieur du fichier
