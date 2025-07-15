import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Clients from "./pages/Clients";
import Reviews from "./pages/Reviews";
import Messages from "./pages/Messages";
import PendingDeliveries from "./pages/PendingDeliveries";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import AccessDenied from "./pages/AccessDenied";
import ActivityLogs from "./pages/ActivityLogs";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider, ROLES, PERMISSIONS } from "./contexts/RoleContext";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/acces-refuse" element={<AccessDenied />} />
            
            {/* Routes protégées avec différents niveaux d'accès */}
            <Route element={<Layout />}>
              {/* Tableau de bord - accessible à tous les utilisateurs authentifiés */}
              <Route index element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Commandes - accessible aux managers et supérieurs */}
              <Route path="commandes" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_ORDERS}>
                  <Orders />
                </ProtectedRoute>
              } />
              
              {/* Produits - accessible aux gestionnaires et supérieurs */}
              <Route path="produits" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_PRODUCTS}>
                  <Products />
                </ProtectedRoute>
              } />
              
              {/* Catégories - accessible aux gestionnaires et supérieurs */}
              <Route path="categories" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_PRODUCTS}>
                  <Categories />
                </ProtectedRoute>
              } />
              
              {/* Marques - accessible aux gestionnaires et supérieurs */}
              <Route path="marques" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_PRODUCTS}>
                  <Brands />
                </ProtectedRoute>
              } />
              
              {/* Clients - accessible aux managers et supérieurs */}
              <Route path="clients" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_CLIENT_DETAILS}>
                  <Clients />
                </ProtectedRoute>
              } />
              
              {/* Journaux d'activité - accessible selon les permissions VIEW_ALL_LOGS */}
              <Route path="journaux-activite" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ALL_LOGS}>
                  <ActivityLogs />
                </ProtectedRoute>
              } />
              
              {/* Avis - accessible aux managers et supérieurs */}
              <Route path="avis" element={
                <ProtectedRoute requiredRole={ROLES.MANAGER}>
                  <Reviews />
                </ProtectedRoute>
              } />
              
              {/* Livraisons en attente - livreurs */}
              <Route path="livraisons-attente" element={
                <ProtectedRoute requiredRole={ROLES.LIVREUR}>
                  <PendingDeliveries />
                </ProtectedRoute>
              } />

              {/* Messages - accessible aux managers et supérieurs */}
              <Route path="messages" element={
                <ProtectedRoute requiredRole={ROLES.MANAGER}>
                  <Messages />
                </ProtectedRoute>
              } />
              
              {/* Profil - accessible à tous les utilisateurs authentifiés */}
              <Route path="profil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Gestion des utilisateurs - accessible aux fondateurs */}
              <Route path="utilisateurs" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* Paramètres - accessible uniquement aux administrateurs et fondateurs */}
              <Route path="parametres" element={
                <ProtectedRoute requiredRole={ROLES.ADMINISTRATEUR}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
