import React, { useState, useEffect } from 'react';
import activityLogService from '../services/activityLogService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20); // Aligné avec le PAGE_SIZE du backend (20)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Utiliser page_size pour s'assurer que le backend renvoie le bon nombre d'éléments
        const data = await activityLogService.getLogs({ 
          page: currentPage,
          page_size: itemsPerPage 
        });
        console.log('Logs reçus:', data);
        
        // Traitement des données selon leur format
        let logsArray = [];
        let total = 0;
        
        if (Array.isArray(data)) {
          logsArray = data;
          total = data.length;
        } else if (data && typeof data === 'object') {
          // Si c'est un objet paginé
          logsArray = data.results || data.data || [];
          
          // Récupérer le nombre total d'éléments pour la pagination
          if (data.count !== undefined) {
            total = data.count;
          } else if (data.total !== undefined) {
            total = data.total;
          } else {
            total = logsArray.length;
          }
        }
        
        // Calculer le nombre total de pages
        const pages = Math.max(1, Math.ceil(total / itemsPerPage));
        setTotalPages(pages);
        
        console.log('Logs traités:', logsArray, 'Total pages:', pages);
        setLogs(logsArray);
      } catch (err) {
        setError('Erreur lors de la récupération des logs.');
        console.error('Erreur détaillée:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, itemsPerPage]);

  // Gestion du changement de page
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
  
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des logs...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Journal d'Activité
      </h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Utilisateur</th>
              <th style={{ padding: '12px' }}>Action</th>
              <th style={{ padding: '12px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {log.user_details ? log.user_details.username : 'Système'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>
                      {log.action_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{log.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                  Aucun log à afficher pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

// Styles pour la pagination et autres éléments
const styles = {
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
    borderRadius: '4px',
    fontSize: '14px',
  },
  pageButtonActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: '1px solid #2563eb',
  },
};

export default ActivityLogs;
