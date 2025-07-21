import Sidebar from "./Sidebar";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import NotificationIcon from "./NotificationIcon";

export default function Layout() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Déterminer le titre en fonction de la route active
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Tableau de bord';
    if (path === '/commandes') return 'Commandes';
    if (path === '/produits') return 'Produits';
    if (path === '/clients') return 'Clients';
    if (path === '/avis') return 'Avis & Commentaires';
    if (path === '/messages') return 'Messages';
    if (path === '/livraisons-attente') return 'Livraisons en attente';
    if (path === '/mes-livraisons') return 'Mes Livraisons';
    if (path === '/parametres') return 'Paramètres';
    if (path === '/notifications') return 'Notifications';
    
    return 'Tableau de bord';
  };
  return (
    <div className={`admin-layout ${isMobileOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="main-content">
        {/* Header */}
        <header className="admin-header">
          <h1>{getPageTitle()}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationIcon />
            <Link to="profil" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ cursor: 'pointer' }}>👤 {currentUser?.first_name || currentUser?.username || 'Utilisateur'}</span>
            </Link>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
