import { useEffect, useState } from 'react';
import brandService from '../services/brandService';

// Styles similaires à la page Produits
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
  formRow: {
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
  addButton: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold'
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
  actionBtn: {
    marginRight: '8px',
    padding: '6px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  editBtn: {
    backgroundColor: '#f39c12',
    color: '#fff'
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff'
  },
  error: {
    color: '#e74c3c',
    marginBottom: '10px'
  }
};

function Brands() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const data = await brandService.getAll();
      setItems(data);
    } catch (err) {
      setError('Erreur de chargement');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (editingId) {
        await brandService.update(editingId, { nom: name });
      } else {
        await brandService.create({ nom: name });
      }
      setName('');
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError('Erreur de sauvegarde');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.nom);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    try {
      await brandService.delete(id);
      fetchData();
    } catch (err) { setError('Erreur de suppression'); }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏷️ Gestion des Marques</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.formRow}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" style={styles.input} />
        <button onClick={handleSave} style={styles.addButton}>{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Nom</th><th style={styles.th}>Actions</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={styles.td}>{item.id}</td>
              <td style={styles.td}>{item.nom}</td>
              <td>
                <button onClick={() => startEdit(item)} style={{...styles.actionBtn, ...styles.editBtn}}>Modifier</button>
                <button onClick={() => handleDelete(item.id)} style={{...styles.actionBtn, ...styles.deleteBtn}}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Brands;
