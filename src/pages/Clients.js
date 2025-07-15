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
  }
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      
      // Récupérer les clients
      
      // Continuer avec l'appel normal
      const data = await clientService.getAllClients(1, params);
      // Utiliser les données réelles de l'API
      
      // Traitement des données
      let fetched = [];
      if (data && data.results) {
        fetched = Array.isArray(data.results) ? data.results : [];
      } else if (Array.isArray(data)) {
        fetched = data;
      }
      // Filtrage côté client si l'API ne filtre pas correctement
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

  useEffect(() => { fetchClients(); }, [search]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Gestion des Clients</h2>
      {error && <p style={styles.error}>{error}</p>}
      

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
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.id}</td>
                <td style={styles.td}>{clientService.formatClientName(c)}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.is_active ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
