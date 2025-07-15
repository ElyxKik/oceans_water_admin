import { useEffect, useState } from 'react';
import productService from '../services/productService';
import clientService from '../services/clientService';
import orderService from '../services/orderService';

export default function Dashboard() {
  // Styles pour la responsivité
  const styles = {
    container: {
      padding: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem'
    },
    statBox: {
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    statIcon: {
      fontSize: '1.5rem'
    },
    statTitle: {
      margin: 0,
      fontSize: '1rem'
    },
    statValue: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    chartBox: {
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1rem'
    },
    chartTitle: {
      marginBottom: '1rem',
      fontWeight: '500',
      fontSize: '1.1rem'
    },
    pieChartContainer: {
      height: '200px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    pieChart: {
      position: 'relative',
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      minWidth: '150px'
    },
    pieChartCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'white'
    },
    legendContainer: {
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'wrap',
      maxHeight: '180px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      minWidth: '120px'
    },
    legendColor: {
      width: '12px',
      height: '12px',
      marginRight: '0.5rem'
    },
    ordersTable: {
      width: '100%',
      borderCollapse: 'collapse',
      overflowX: 'auto'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      marginTop: '1.5rem',
      overflowX: 'auto'
    },
    tableHeader: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderRow: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      whiteSpace: 'nowrap'
    },
    tableCell: {
      padding: '0.75rem 1rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb'
    },
    statusBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      display: 'inline-block',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    actionButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '0.25rem',
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    barChart: {
      height: '200px',
      position: 'relative'
    },
    barContainer: {
      display: 'flex',
      height: '100%',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: '0 1rem'
    },
    barColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '30px',
      minWidth: '20px'
    },
    bar: {
      width: '100%',
      backgroundColor: '#3b82f6',
      borderRadius: '4px 4px 0 0',
      transition: 'height 0.3s ease'
    },
    barLabel: {
      marginTop: '0.5rem',
      fontSize: '0.75rem'
    },
    '@media (max-width: 768px)': {
      statsGrid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))'
      },
      chartsGrid: {
        gridTemplateColumns: '1fr'
      },
      tableHeaderCell: {
        padding: '0.5rem'
      },
      tableCell: {
        padding: '0.5rem'
      }
    }
  };
    const [stats, setStats] = useState([]);
  const [productDist, setProductDist] = useState([]);
  const [distGradient, setDistGradient] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, clientsData, ordersData, categoriesData] = await Promise.all([
        productService.getAllProducts(1, {}),
        clientService.getAllClients(1, {}),
        orderService.getAllOrders(1, { ordering: '-date' }),
        productService.getAllCategories()
      ]);

      const totalOrders = ordersData.count || 0;
      const totalProducts = productsData.count || 0;
      const totalClients = clientsData.count || 0;
      const pendingOrders = (ordersData.results || []).filter(o => ['en_attente', 'pending', 'En attente'].includes(o.statut || o.status)).length;
      const validatedOrders = (ordersData.results || []).filter(o => ['confirmee', 'validée', 'Validée'].includes(o.statut || o.status)).length;

      // Distribution par catégorie
      const categoryMap = {};
      (categoriesData.results || categoriesData).forEach(cat => {
        categoryMap[cat.id] = cat.nom || cat.name;
      });
      const counts = {};
      (productsData.results || []).forEach(p => {
        let catId = p.categorie;
        if (typeof catId === 'object' && catId !== null) catId = catId.id;
        const catName = categoryMap[catId] || 'Autres';
        counts[catName] = (counts[catName] || 0) + 1;
      });
      const distArr = Object.keys(counts).map((name, idx) => ({
        name,
        count: counts[name],
        percent: ((counts[name] / totalProducts) * 100).toFixed(1),
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]
      })).sort((a,b)=>b.count-a.count);
      setProductDist(distArr);
      // Build conic gradient
      let cumulative = 0;
      const segments = distArr.map(d => {
        const start = cumulative;
        cumulative += parseFloat(d.percent);
        return `${d.color} ${start}% ${cumulative}%`;
      });
      setDistGradient(`conic-gradient(${segments.join(', ')})`);

      setStats([
        { title: 'Commandes Totales', value: totalOrders, icon: '📦', color: '#3b82f6' },
        { title: 'Produits en Vente', value: totalProducts, icon: '🛒', color: '#10b981' },
        { title: 'Clients Inscrits', value: totalClients, icon: '👥', color: '#f59e0b' },
        { title: 'Commandes en Attente', value: pendingOrders, icon: '⏳', color: '#ef4444' },
        { title: 'Commandes Validées', value: validatedOrders, icon: '✅', color: '#8b5cf6' },
      ]);

      // Prendre les 5 commandes les plus récentes
      const recent = (ordersData.results || []).slice(0, 5).map(o => ({
        id: o.code || `CMD-${o.id}`,
        date: o.date || o.created_at || '',
        client: o.client_nom || (o.client && (o.client.full_name || o.client.username || o.client.email)) || 'Client',
        total: o.total || o.montant_total || '',
        status: o.statut || o.status || 'en_attente'
      }));
      setRecentOrders(recent);
    } catch (err) {
      console.error('Erreur dashboard:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Style pour les badges de statut


  

  // Style pour les badges de statut
  const getStatusStyle = (status) => {
    switch(status) {
      case 'En attente':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Validée':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Livrée':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Annulée':
        return { backgroundColor: '#fee2e2', color: '#b91c1c' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
  };
  
  return (
    <section>
      {/* Grille de statistiques */}
      <div style={styles.statsGrid}>
        {loading ? (
          <p>Chargement…</p>
        ) : stats.map((stat, index) => (
          <div style={styles.statBox} key={index}>
            <div style={styles.statHeader}>
              <span style={{...styles.statIcon, color: stat.color}}>{stat.icon}</span>
              <h3 style={styles.statTitle}>{stat.title}</h3>
            </div>
            <p style={{...styles.statValue, color: stat.color}}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Section graphiques */}
      <div style={styles.chartsGrid}>
        {/* Graphique des ventes */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Ventes Mensuelles</h3>
          <div style={styles.barChart}>
            {/* Simulation d'un graphique avec des barres */}
            <div style={styles.barContainer}>
              {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'].map((month, i) => {
                const height = [60, 45, 75, 50, 85, 70, 90][i];
                return (
                  <div key={month} style={styles.barColumn}>
                    <div 
                      style={{ 
                        ...styles.bar,
                        height: `${height}%`
                      }} 
                    />
                    <span style={styles.barLabel}>{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Répartition des produits */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Répartition des Produits</h3>
          <div style={styles.pieChartContainer}>
            {/* Simulation d'un graphique en camembert */}
            <div style={{ ...styles.pieChart, background: distGradient || '#e5e7eb' }}>
              <div style={styles.pieChartCenter}></div>
            </div>
            <div style={styles.legendContainer}>
               {productDist.map(d => (
                 <div key={d.name} style={styles.legendItem}>
                   <div style={{ ...styles.legendColor, backgroundColor: d.color }}></div>
                   <span>{`${d.name} (${d.percent}%)`}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Commandes récentes */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={{ fontWeight: '500' }}>Commandes Récentes</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
        <table style={styles.ordersTable}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>ID</th>
              <th style={styles.tableHeaderCell}>Date</th>
              <th style={styles.tableHeaderCell}>Client</th>
              <th style={styles.tableHeaderCell}>Total</th>
              <th style={styles.tableHeaderCell}>Statut</th>
              <th style={{...styles.tableHeaderCell, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
            <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>Chargement…</td></tr>
          ) : recentOrders.map(order => (
              <tr key={order.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{order.id}</td>
                <td style={styles.tableCell}>{order.date}</td>
                <td style={styles.tableCell}>{order.client}</td>
                <td style={styles.tableCell}>{order.total}</td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                    {order.status}
                  </span>
                </td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>
                  <button style={styles.actionButton}>Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <a href="/commandes" style={{ color: '#3b82f6', textDecoration: 'none' }}>Voir toutes les commandes →</a>
        </div>
      </div>
    </section>
  );
}
