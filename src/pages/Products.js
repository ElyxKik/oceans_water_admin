import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';

// Styles pour la page Products
const styles = {
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
  linkButton: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  brandButton: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 'bold'
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
  noProducts: {
    textAlign: 'center',
    padding: '30px',
    color: '#7f8c8d',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
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
  productImage: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover'
  },
  noImage: {
    fontSize: '10px',
    color: '#95a5a6',
    textAlign: 'center'
  },
  statusActive: {
    backgroundColor: '#d5f5e3',
    color: '#27ae60',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  statusInactive: {
    backgroundColor: '#f8d7da',
    color: '#e74c3c',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  viewButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '5px',
    borderRadius: '4px',
    color: '#3498db',
    transition: 'background-color 0.2s'
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '20px'
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  pageInfo: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  // Styles pour le modal
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
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative'
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
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#7f8c8d'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  detailItem: {
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#7f8c8d',
    fontSize: '14px',
    marginBottom: '5px'
  },
  detailValue: {
    fontSize: '16px',
    color: '#2c3e50'
  },
  detailImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    display: 'block',
    marginTop: '10px',
    borderRadius: '4px'
  }
};

export default function Products() {
  // États pour la liste des produits
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // États pour le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  
  // États pour les listes de catégories et marques
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // État pour le produit sélectionné (édition/visualisation)
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // État pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    prix_consigne: '0.00',
    vendu_avec_consigne: false,
    categorie: '',
    marque: '',
    stock: '0',
    disponible: true,
    unite: 'bouteille',
    image: null
  });
  
  // Chargement initial des produits
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [currentPage, searchTerm, categoryFilter, brandFilter]);
  
  // Fonction pour récupérer les produits
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (categoryFilter) filters.categorie = categoryFilter;
      if (brandFilter) filters.marque = brandFilter;
      
      const data = await productService.getAllProducts(currentPage, filters);
      setProducts(data.results || []);
      setTotalPages(Math.ceil(data.count / 10)); // Supposons 10 éléments par page
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour récupérer les catégories
  const fetchCategories = async () => {
    try {
      const data = await productService.getAllCategories();
      setCategories(data.results || []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };
  
  // Fonction pour récupérer les marques
  const fetchBrands = async () => {
    try {
      const data = await productService.getAllBrands();
      setBrands(data.results || []);
    } catch (err) {
      console.error('Erreur lors du chargement des marques:', err);
    }
  };
  
  // Fonction pour ouvrir le modal selon le mode
  const handleOpenModal = (mode, product = null) => {
    if (mode === 'create') {
      setFormData({
        nom: '',
        description: '',
        prix: '',
        prix_consigne: '0.00',
        vendu_avec_consigne: false,
        categorie: '',
        marque: '',
        stock: '0',
        disponible: true,
        unite: 'bouteille',
        image: null
      });
    } else if (product) {
      setSelectedProduct(product);
      
      if (mode === 'edit') {
        setFormData({
          nom: product.nom,
          description: product.description || '',
          prix: product.prix.toString(),
          prix_consigne: product.prix_consigne ? product.prix_consigne.toString() : '0.00',
          vendu_avec_consigne: product.vendu_avec_consigne || false,
          promo_active: product.promo_active || false,
          prix_promo: product.prix_promo ? product.prix_promo.toString() : '',
          promo_debut: product.promo_debut ? product.promo_debut.split('T')[0] : '',
          promo_fin: product.promo_fin ? product.promo_fin.split('T')[0] : '',
          categorie: product.categorie?.id.toString() || '',
          marque: product.marque ? product.marque.id.toString() : '',
          stock: product.stock.toString(),
          disponible: product.disponible,
          unite: product.unite || 'bouteille',
          image: null // On ne charge pas l'image existante dans le formulaire
        });
      }
    }
    
    setModalMode(mode);
    setIsModalOpen(true);
  };
  
  // Fonction pour ouvrir le modal en mode création (pour compatibilité)
  const handleCreateProduct = () => {
    handleOpenModal('create');
  };
  
  // Fonction pour ouvrir le modal en mode visualisation (pour compatibilité)
  const handleViewProduct = (product) => {
    handleOpenModal('view', product);
  };
  
  // Fonction pour ouvrir le modal en mode édition (pour compatibilité)
  const handleEditProduct = (product) => {
    handleOpenModal('edit', product);
  };
  
  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  
  // Fonction pour gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const productData = {
        ...formData,
        prix: parseFloat(formData.prix),
        prix_consigne: parseFloat(formData.prix_consigne),
        stock: parseInt(formData.stock, 10),
        categorie: parseInt(formData.categorie, 10),
        marque: formData.marque ? parseInt(formData.marque, 10) : null,
        promo_active: formData.promo_active,
        prix_promo: formData.prix_promo ? parseFloat(formData.prix_promo) : null,
        promo_debut: formData.promo_debut || null,
        promo_fin: formData.promo_fin || null
      };
      // Si l'image n'a pas été modifiée, on ne l'envoie pas
      if (!formData.image) {
        delete productData.image;
      }
      
      if (modalMode === 'create') {
        await productService.createProduct(productData);
      } else if (modalMode === 'edit' && selectedProduct) {
        await productService.updateProduct(selectedProduct.id, productData);
      }
      
      fetchProducts(); // Recharger la liste des produits
      handleCloseModal(); // Fermer le modal
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du produit:', err);
      setError('Impossible de sauvegarder le produit. Veuillez vérifier les données et réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await productService.deleteProduct(productId);
      fetchProducts(); // Recharger la liste des produits
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      setError('Impossible de supprimer le produit. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour gérer la pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Fonction pour gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Revenir à la première page lors d'une recherche
  };
  
  // Fonction pour gérer le filtre par catégorie
  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Revenir à la première page lors d'un filtrage
  };
  
  // Fonction pour gérer le filtre par marque
  const handleBrandFilter = (e) => {
    setBrandFilter(e.target.value);
    setCurrentPage(1); // Revenir à la première page lors d'un filtrage
  };
  
  // Fonction pour formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <>
      <section style={styles.container}>
        <h2 style={styles.title}>📜 Gestion des Produits</h2>
        
        {/* Barre d'outils */}
        <div style={styles.toolbar}>
          {/* Liens gestion */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/categories" style={styles.linkButton}>Catégories</Link>
            <Link to="/marques" style={styles.brandButton}>Marques</Link>
          </div>
          <div style={styles.searchFilters}>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={handleSearch}
              style={styles.searchInput}
            />
            
            <select 
              value={categoryFilter} 
              onChange={handleCategoryFilter}
              style={styles.select}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
            
            <select 
              value={brandFilter} 
              onChange={handleBrandFilter}
              style={styles.select}
            >
              <option value="">Toutes les marques</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.nom}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => handleOpenModal('create')}
            style={styles.addButton}
          >
            + Ajouter un produit
          </button>
        </div>
        
        {/* Message d'erreur */}
        {error && <div style={styles.error}>{error}</div>}
        
        {/* Tableau des produits */}
        {loading ? (
          <div style={styles.loading}>Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div style={styles.noProducts}>
            Aucun produit trouvé. {searchTerm || categoryFilter || brandFilter ? 'Essayez de modifier vos filtres.' : ''}
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Catégorie</th>
                  <th style={styles.th}>Marque</th>
                  <th style={styles.th}>Prix</th>
                  <th style={styles.th}>Promo (%)</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Disponible</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.productImage}>
                        {product.image ? (
                          <img 
                            src={product.image.startsWith('http') ? product.image : `http://localhost:8000${product.image}`} 
                            alt={product.nom} 
                            style={styles.image}
                          />
                        ) : (
                          <div style={styles.noImage}>Pas d'image</div>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>{product.nom}</td>
                    <td style={styles.td}>{product.categorie?.nom || 'Non catégorisé'}</td>
                    <td style={styles.td}>{product.marque?.nom || 'Sans marque'}</td>
                    <td style={styles.td}>{formatPrice(product.prix)}</td>
                     <td style={styles.td}>{product.promo_active && product.prix_promo ? Math.round((1 - product.prix_promo / product.prix) * 100) : 0}%</td>
                    <td style={styles.td}>{product.stock}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: product.disponible ? '#dcfce7' : '#fee2e2',
                        color: product.disponible ? '#166534' : '#b91c1c'
                      }}>
                        {product.disponible ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button 
                          onClick={() => handleOpenModal('view', product)}
                          style={styles.viewButton}
                        >
                          Voir
                        </button>
                        <button 
                          onClick={() => handleOpenModal('edit', product)}
                          style={styles.editButton}
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          style={styles.deleteButton}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.pageInfo}>
              Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, (currentPage - 1) * 10 + products.length)} sur {totalPages * 10} produits
            </div>
            <div style={styles.pageButtons}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={currentPage === 1 ? {...styles.pageButton, ...styles.disabledButton} : styles.pageButton}
              >
                Précédent
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={currentPage === totalPages ? {...styles.pageButton, ...styles.disabledButton} : styles.pageButton}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </section>
      
      {/* Modal pour créer/éditer/voir un produit */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>
              {modalMode === 'create' ? 'Ajouter un produit' : 
               modalMode === 'edit' ? 'Modifier le produit' : 
               'Détails du produit'}
            </h3>
            <button 
              onClick={handleCloseModal}
              style={styles.closeButton}
            >
              ×
            </button>
          </div>
          
          {modalMode === 'view' && selectedProduct ? (
            <div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Image</div>
                {selectedProduct.image ? (
                  <img 
                    src={selectedProduct.image.startsWith('http') ? 
                         selectedProduct.image : 
                         `http://localhost:8000${selectedProduct.image}`} 
                    alt={selectedProduct.nom} 
                    style={styles.detailImage} 
                  />
                ) : (
                  <div>Pas d'image disponible</div>
                )}
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Nom</div>
                <div style={styles.detailValue}>{selectedProduct.nom}</div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Description</div>
                <div style={styles.detailValue}>
                  {selectedProduct.description || 'Aucune description'}
                </div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Catégorie</div>
                <div style={styles.detailValue}>
                  {selectedProduct.categorie?.nom || '-'}
                </div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Marque</div>
                <div style={styles.detailValue}>
                  {selectedProduct.marque?.nom || '-'}
                </div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Prix</div>
                <div style={styles.detailValue}>
                  {formatPrice(selectedProduct.prix)}
                </div>
              </div>
              
              {selectedProduct.vendu_avec_consigne && (
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Prix consigne</div>
                  <div style={styles.detailValue}>
                    {formatPrice(selectedProduct.prix_consigne)}
                  </div>
                </div>
              )}
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Stock</div>
                <div style={styles.detailValue}>{selectedProduct.stock}</div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Unité</div>
                <div style={styles.detailValue}>
                  {selectedProduct.unite === 'bouteille' ? 'Bouteille' : 'Pack'}
                </div>
              </div>
              
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Statut</div>
                <div style={styles.detailValue}>
                  <span style={selectedProduct.disponible ? styles.statusActive : styles.statusInactive}>
                    {selectedProduct.disponible ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </div>
              
              <div style={styles.buttonGroup}>
                <button 
                  onClick={() => handleEditProduct(selectedProduct)}
                  style={styles.submitButton}
                >
                  Modifier
                </button>
                <button 
                  onClick={handleCloseModal}
                  style={styles.cancelButton}
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="nom" style={styles.label}>Nom du produit *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleFormChange}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="description" style={styles.label}>Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  style={styles.textarea}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="categorie" style={styles.label}>Catégorie *</label>
                <select
                  id="categorie"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleFormChange}
                  required
                  style={styles.select}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="marque" style={styles.label}>Marque</label>
                <select
                  id="marque"
                  name="marque"
                  value={formData.marque}
                  onChange={handleFormChange}
                  style={styles.select}
                >
                  <option value="">Sélectionner une marque</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="prix" style={styles.label}>Prix (CDF) *</label>
                <input
                  type="number"
                  id="prix"
                  name="prix"
                  value={formData.prix}
                  onChange={handleFormChange}
                  required
                  min="0.01"
                  step="0.01"
                  style={styles.input}
                />
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  id="vendu_avec_consigne"
                  name="vendu_avec_consigne"
                  checked={formData.vendu_avec_consigne}
                  onChange={handleFormChange}
                />
                <label htmlFor="vendu_avec_consigne" style={{...styles.label, marginBottom: 0}}>
                  Vendu avec consigne
                </label>
              </div>
              
              {/* Promotion */}
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  id="promo_active"
                  name="promo_active"
                  checked={formData.promo_active}
                  onChange={handleFormChange}
                />
                <label htmlFor="promo_active" style={{...styles.label, marginBottom: 0}}>
                  Promotion active
                </label>
              </div>

              {formData.promo_active && (
                <>
                <div style={styles.formGroup}>
                  <label htmlFor="prix_promo" style={styles.label}>Prix promotionnel (CDF)</label>
                  <input
                    type="number"
                    id="prix_promo"
                    name="prix_promo"
                    value={formData.prix_promo}
                    onChange={handleFormChange}
                    min="0.01"
                    step="0.01"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="promo_debut" style={styles.label}>Début promo</label>
                  <input
                    type="date"
                    id="promo_debut"
                    name="promo_debut"
                    value={formData.promo_debut}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="promo_fin" style={styles.label}>Fin promo</label>
                  <input
                    type="date"
                    id="promo_fin"
                    name="promo_fin"
                    value={formData.promo_fin}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                </div>
                </>
              )}

              {formData.vendu_avec_consigne && (
                <div style={styles.formGroup}>
                  <label htmlFor="prix_consigne" style={styles.label}>Prix consigne (CDF)</label>
                  <input
                    type="number"
                    id="prix_consigne"
                    name="prix_consigne"
                    value={formData.prix_consigne}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    style={styles.input}
                  />
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label htmlFor="stock" style={styles.label}>Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleFormChange}
                  min="0"
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="unite" style={styles.label}>Unité</label>
                <select
                  id="unite"
                  name="unite"
                  value={formData.unite}
                  onChange={handleFormChange}
                  style={styles.select}
                >
                  <option value="bouteille">Bouteille</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  id="disponible"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleFormChange}
                />
                <label htmlFor="disponible" style={{...styles.label, marginBottom: 0}}>
                  Produit disponible
                </label>
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="image" style={styles.label}>Image du produit</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFormChange}
                  accept="image/*"
                  style={styles.input}
                />
              </div>
              
              <div style={styles.buttonGroup}>
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.cancelButton}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  );
}
