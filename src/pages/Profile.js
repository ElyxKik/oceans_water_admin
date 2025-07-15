import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const [userData, setUserData] = useState(null);

  // Récupérer les données utilisateur directement depuis le localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };
    
    getUserData();
  }, []);

  // Utiliser les données du localStorage ou du contexte
  const user = userData || currentUser;

  if (!user) {
    return <div className="profile-container">Chargement du profil...</div>;
  }

  // Capitalize first letter of the role for display
  const displayEmail = user.email || 'Non Défini du backend';
  const displayRole = user.role 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ') 
    : userRole 
      ? userRole.charAt(0).toUpperCase() + userRole.slice(1).replace('_', ' ') 
      : 'Non Défini du backend';

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Mon Profil</h2>
        </div>
        <div className="profile-body">
          <div className="profile-avatar">
            <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="profile-info">
            <div className="info-item">
              <strong>Nom d'utilisateur:</strong>
              <span>{user.username}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <span>{displayEmail}</span>
            </div>
            <div className="info-item">
              <strong>Rôle:</strong>
              <span className="role-badge">{displayRole}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
