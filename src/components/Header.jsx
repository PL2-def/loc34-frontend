import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Car, LayoutDashboard, Briefcase } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-premium-black text-white py-4 px-4 md:px-8 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Car className="text-premium-gold w-6 h-6" />
          <span className="text-xl font-bold tracking-tight">
            Loc 34
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">Voitures</Link>
          {user && (
            <Link to="/my-bookings" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Briefcase size={16} /> Mes Réservations
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-premium-gold">
                <User size={16} />
                <span>{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-premium-gold hover:bg-premium-gold-light text-white px-4 py-2 text-sm font-medium rounded transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;