import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AdminPage from './AdminPage';
import reportWebVitals from './reportWebVitals';

function AppRouter() {
  const [currentPage, setCurrentPage] = useState('app');

  const switchToAdmin = () => setCurrentPage('admin');
  const switchToApp = () => setCurrentPage('app');

  return (
    <div>
      {currentPage === 'app' ? (
        <div>
          <button 
            className="admin-switch-button"
            onClick={switchToAdmin}
            style={{
              position: 'fixed',
              top: '20px',
              right: '140px',
              zIndex: 1000,
              padding: '10px 20px',
              background: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'Gotham, Helvetica Neue, Arial, sans-serif',
              fontWeight: '700',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#34495e';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2c3e50';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🏢 Admin Panel
          </button>
          <App />
        </div>
      ) : (
        <div>
          <button 
            className="app-switch-button"
            onClick={switchToApp}
            style={{
              position: 'fixed',
              top: '15px',
              right: '20px',
              zIndex: 1000,
              padding: '10px 20px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'Gotham, Helvetica Neue, Arial, sans-serif',
              fontWeight: '700',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2ecc71';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#27ae60';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🍽️ Waiter App
          </button>
          <AdminPage />
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
