import React, { useState, useEffect } from 'react';
import activityLogService from '../services/activityLogService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await activityLogService.getLogs();
        const data = response?.data ?? [];
        const logsArray = Array.isArray(data) ? data : data.results ?? [];
        setLogs(logsArray);
      } catch (err) {
        setError('Erreur lors de la récupération des logs.');
        console.error('Erreur détaillée:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
    </div>
  );
};

export default ActivityLogs;
