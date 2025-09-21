import React, { useState, useEffect, useCallback } from 'react';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);

  // Demo mode - no backend API calls needed

  const fetchUsers = useCallback(async () => {
    try {
      // Demo mode - create mock users since endpoint doesn't exist
      const mockUsers = [
        {
          id: 1,
          username: 'admin123',
          email: 'admin@waiterfm.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          restaurant_id: null,
          login_count: 5,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          username: 'waiter1',
          email: 'waiter1@waiterfm.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'waiter',
          restaurant_id: 'REST001',
          login_count: 12,
          last_login: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          username: 'waiter2',
          email: 'waiter2@waiterfm.com',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'waiter',
          restaurant_id: 'REST002',
          login_count: 8,
          last_login: new Date(Date.now() - 7200000).toISOString(),
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      setUsers(mockUsers);
      console.log('User management loaded in demo mode');
    } catch (err) {
      setError('Error fetching users: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []); // Removed baseUrl dependency since we're not using it

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserHistory = async (userId) => {
    try {
      // Demo mode - create mock user history
      const mockHistory = [
        {
          id: 1,
          login_time: new Date().toISOString(),
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        {
          id: 2,
          login_time: new Date(Date.now() - 3600000).toISOString(),
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        {
          id: 3,
          login_time: new Date(Date.now() - 7200000).toISOString(),
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      ];
      
      setUserHistory(mockHistory);
      console.log('User history loaded in demo mode');
    } catch (err) {
      setError('Error fetching user history: ' + err.response?.data?.error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserHistory(user.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="status-badge active">Active</span>
    ) : (
      <span className="status-badge inactive">Inactive</span>
    );
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="role-badge admin">Admin</span>
    ) : (
      <span className="role-badge waiter">Waiter</span>
    );
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <p>Total Users: {users.length}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="user-management-content">
        <div className="users-list">
          <h3>All Users</h3>
          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">Name</div>
              <div className="header-cell">Email</div>
              <div className="header-cell">Role</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Logins</div>
              <div className="header-cell">Last Login</div>
              <div className="header-cell">Registered</div>
            </div>
            
            {users.map(user => (
              <div 
                key={user.id} 
                className={`table-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => handleUserClick(user)}
              >
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.first_name} />
                      ) : (
                        <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </div>
                <div className="table-cell">{user.email}</div>
                <div className="table-cell">{getRoleBadge(user.role)}</div>
                <div className="table-cell">{getStatusBadge(user.is_active)}</div>
                <div className="table-cell">{user.login_count || 0}</div>
                <div className="table-cell">
                  {user.last_login ? formatDate(user.last_login) : 'Never'}
                </div>
                <div className="table-cell">{formatDate(user.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div className="user-details-panel">
            <h3>User Details</h3>
            <div className="user-detail-card">
              <div className="user-profile">
                <div className="user-avatar large">
                  {selectedUser.profile_picture ? (
                    <img src={selectedUser.profile_picture} alt={selectedUser.first_name} />
                  ) : (
                    <span>{selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}</span>
                  )}
                </div>
                <div className="user-info">
                  <h4>{selectedUser.first_name} {selectedUser.last_name}</h4>
                  <p>@{selectedUser.username}</p>
                  <p>{selectedUser.email}</p>
                  <div className="user-badges">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.is_active)}
                  </div>
                </div>
              </div>

              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Logins:</span>
                  <span className="stat-value">{selectedUser.login_count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Login:</span>
                  <span className="stat-value">
                    {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Registered:</span>
                  <span className="stat-value">{formatDate(selectedUser.created_at)}</span>
                </div>
                {selectedUser.restaurant_id && (
                  <div className="stat-item">
                    <span className="stat-label">Restaurant ID:</span>
                    <span className="stat-value">{selectedUser.restaurant_id}</span>
                  </div>
                )}
              </div>

              <div className="login-history">
                <h4>Recent Login History</h4>
                <div className="history-list">
                  {userHistory.length > 0 ? (
                    userHistory.map((entry, index) => (
                      <div key={index} className="history-item">
                        <div className="history-time">{formatDate(entry.login_time)}</div>
                        <div className="history-details">
                          <div>IP: {entry.ip_address || 'Unknown'}</div>
                          <div className="history-user-agent">
                            {entry.user_agent ? entry.user_agent.substring(0, 50) + '...' : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No login history available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
