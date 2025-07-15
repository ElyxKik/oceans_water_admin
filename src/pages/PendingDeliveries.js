import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/orderService";

export default function PendingDeliveries() {
  const { token } = useAuth(); // token may be used by orderService internally via api interceptor
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders(1, { statut: 'confirmee' });
      setDeliveries(data.results || data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des livraisons");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markDelivered = async (id) => {
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(id, 'livree');
      setSelected(null);
      await loadDeliveries();
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le statut");
    }
    setUpdating(false);
  };

  return (
    <div className="page-container">
      <h1>Livraisons en attente</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : deliveries.length === 0 ? (
        <p>Aucune livraison en attente.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Adresse</th>
              <th>Montant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.client_name}</td>
                <td>{d.adresse_livraison}</td>
                <td>{d.total} FC</td>
                <td>
                  <button onClick={() => setSelected(d)}>Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Commande #{selected.id}</h2>
            <p><strong>Client:</strong> {selected.client_name}</p>
            <p><strong>Adresse:</strong> {selected.adresse_livraison}</p>
            <p><strong>Montant:</strong> {selected.total} FC</p>
            <p><strong>Articles:</strong></p>
            <ul>
              {selected.lignes.map((l) => (
                <li key={l.id}>{l.quantite} × {l.produit_nom}</li>
              ))}
            </ul>
            <div className="button-group">
              <button onClick={() => markDelivered(selected.id)} disabled={updating}>
                {updating ? "..." : "Marquer livrée"}
              </button>
              <button onClick={() => setSelected(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
