import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ paddingBottom: 0 }}>
      <header className="app-header">
        <div>
          <h1 className="app-title">Interview Prep</h1>
        </div>
        <nav className="app-nav" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" className="nav-link">Home</Link>
          {user && (
            <>
              <Link to="/resume" className="nav-link">Resume Analysis</Link>
            </>
          )}
          
          {!user ? (
            <>
              <Link to="/login" className="nav-link" style={{ marginLeft: '10px', color: 'var(--primary-color)' }}>Login</Link>
              <Link to="/register" className="nav-link" style={{ color: 'var(--primary-color)' }}>Register</Link>
            </>
          ) : (
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--text-color)', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', borderRadius: '4px' }}
            >
              <LogOut size={16} /> Logout
            </button>
          )}

          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            data-is-dark={theme === 'dark'}
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ marginLeft: '10px' }}
          >
            <div className="theme-toggle-track"></div>
            <div className="theme-toggle-thumb">
            </div>
          </button>
        </nav>
      </header>
    </div>
  );
};

export default Header;
