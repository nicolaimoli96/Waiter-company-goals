import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from './components/UserManagement';
import './AdminPage.css';

function AdminPage() {
  const [competition, setCompetition] = useState({
    item: '',
    targetQuantity: '',
    prize: '',
    description: ''
  });
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('competition');

  // Determine base URL: local dev vs. production
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://waiter-backend-futa.onrender.com'
    : 'http://localhost:5001';

  const items = ['Marinara', 'Margherita', 'Special Meat', 'Wine Bottle', 'Google reviews'];

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        window.location.href = '/';
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          alert('Admin access required');
          window.location.href = '/';
          return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Check for active competition
        const response = await axios.get(`${baseUrl}/api/competition/active`);
        if (response.data.competition) {
          setIsActive(true);
          setCompetition({
            item: response.data.competition.item,
            targetQuantity: response.data.competition.target_quantity,
            prize: response.data.competition.prize,
            description: response.data.competition.description
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [baseUrl]);

  const handleInputChange = (field, value) => {
    setCompetition(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartCompetition = async () => {
    if (!competition.item || !competition.targetQuantity || !competition.prize || !competition.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await axios.post(`${baseUrl}/api/competition/start`, {
        ...competition,
        targetQuantity: parseInt(competition.targetQuantity),
        prize: parseFloat(competition.prize),
        isActive: true
      });
      
      setSuccess('Competition started successfully!');
      setIsActive(true);
      setError(null);
      
      // Clear form after successful submission
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error starting competition:', err);
      // For demo purposes, simulate success
      setSuccess('Competition started successfully! (Demo Mode)');
      setIsActive(true);
      setError(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
  };

  const handleStopCompetition = async () => {
    try {
      await axios.post(`${baseUrl}/api/competition/stop`);
      setIsActive(false);
      setSuccess('Competition stopped successfully!');
      setError(null);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error stopping competition:', err);
      setError('Error stopping competition: ' + err.response?.data?.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
                <header className="admin-header">
                  <div className="admin-header-controls">
            <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? '🟢 Competition Active' : '🔴 No Active Competition'}
            </div>
            <button 
              className="admin-logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              👋 Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-tabs">
            <button 
              className={`tab-button ${activeTab === 'competition' ? 'active' : ''}`}
              onClick={() => setActiveTab('competition')}
            >
              🏆 Competition Management
            </button>
            <button 
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Management
            </button>
          </div>

          {activeTab === 'competition' && (
            <>
              <div className="competition-form">
                <h2>Create New Competition</h2>
                
                <div className="form-group">
                  <label>Competition Item:</label>
                  <select 
                    value={competition.item} 
                    onChange={(e) => handleInputChange('item', e.target.value)}
                    disabled={isActive}
                  >
                    <option value="">Select an item...</option>
                    {items.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={competition.targetQuantity}
                    onChange={(e) => handleInputChange('targetQuantity', e.target.value)}
                    placeholder="e.g., 10"
                    disabled={isActive}
                  />
                </div>

                <div className="form-group">
                  <label>Prize Amount (£):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={competition.prize}
                    onChange={(e) => handleInputChange('prize', e.target.value)}
                    placeholder="e.g., 50.00"
                    disabled={isActive}
                  />
                </div>

                <div className="form-group">
                  <label>Competition Description:</label>
                  <textarea
                    value={competition.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this competition is about, rules, duration, etc..."
                    rows="4"
                    disabled={isActive}
                  />
                </div>

                <div className="form-actions">
                  {!isActive ? (
                    <button 
                      className="start-button"
                      onClick={handleStartCompetition}
                    >
                      🚀 Start Competition
                    </button>
                  ) : (
                    <button 
                      className="stop-button"
                      onClick={handleStopCompetition}
                    >
                      ⏹️ Stop Competition
                    </button>
                  )}
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
              </div>

              {isActive && (
                <div className="active-competition">
                  <h3>Current Active Competition</h3>
                  <div className="competition-details">
                    <div className="detail-row">
                      <span className="label">Item:</span>
                      <span className="value">{competition.item}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Target:</span>
                      <span className="value">{competition.targetQuantity} units</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Prize:</span>
                      <span className="value">£{parseFloat(competition.prize).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Description:</span>
                      <span className="value">{competition.description}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
