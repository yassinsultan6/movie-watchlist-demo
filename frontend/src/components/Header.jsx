import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="app-header">
      <Link to="/" className="logo" onClick={closeMenu}>MovieApp</Link>
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        &#9776; {/* Hamburger Icon */}
      </div>
      <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          <>
            <Link to="/movies" onClick={closeMenu}>Movies</Link>
            <Link to="/watchlist" onClick={closeMenu}>My Watchlist</Link>
            <button onClick={handleLogout}>Logout ({user?.name})</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
