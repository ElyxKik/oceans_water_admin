import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Déterminer le titre en fonction de la route active
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Tableau de bord';
    if (path === '/commandes') return 'Commandes';
    if (path === '/produits') return 'Produits';
    if (path === '/clients') return 'Clients';
    if (path === '/avis') return 'Avis & Commentaires';
    if (path === '/messages') return 'Messages';
    if (path === '/parametres') return 'Paramètres';
    
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
            <span style={{ position: 'relative', cursor: 'pointer' }}>
              🔔<span style={{ position: 'absolute', top: '-4px', right: '-8px', backgroundColor: '#ef4444', fontSize: '0.75rem', borderRadius: '9999px', padding: '0 4px' }}>3</span>
            </span>
            <span style={{ cursor: 'pointer' }}>👤 Admin</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
