import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './components/Auth';
import './App.css';


function ActivityRings({ items, onRingClick, competition, competitionParticipation, competitionActual }) {
  console.log('ActivityRings props:', { competition, competitionParticipation, competitionActual });
  const size = 320;
  const center = size / 2;
  const ringSpecs = [
    { stroke: 20, inset: 0 },
    { stroke: 20, inset: 30 },
    { stroke: 20, inset: 60 },
    { stroke: 20, inset: 90 }, // Competition ring
  ];

  return (
    <svg width={size} height={size} className="activity-rings">
      <defs>
        {items.map((it, idx) => (
          <linearGradient key={idx} id={`ringGrad${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={it.color[0]} />
            <stop offset="100%" stopColor={it.color[1]} />
          </linearGradient>
        ))}
        {competition && competitionParticipation && (
          <linearGradient id="competitionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#ffed4e" />
          </linearGradient>
        )}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background rings */}
      {items.map((it, idx) => {
        const spec = ringSpecs[idx];
        const radius = (size - spec.stroke) / 2 - spec.inset;
        return (
          <circle
            key={`bg-${idx}`}
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={spec.stroke}
            fill="none"
          />
        );
      })}
      
      {/* Competition background ring */}
      {competition && competitionParticipation && (
        <circle
          cx={center}
          cy={center}
          r={(size - ringSpecs[3].stroke) / 2 - ringSpecs[3].inset}
          stroke="rgba(255,215,0,0.15)"
          strokeWidth={ringSpecs[3].stroke}
          fill="none"
        />
      )}
      
      {/* Progress rings */}
      {items.map((it, idx) => {
        const spec = ringSpecs[idx];
        const radius = (size - spec.stroke) / 2 - spec.inset;
        const circumference = 2 * Math.PI * radius;
        const safeTarget = Math.max(it.target, 1);
        const pct = Math.min(it.actual / safeTarget, 1);
        const offset = pct >= 1 ? 0 : circumference * (1 - pct);
        
        return (
          <g key={idx} className="activity-ring">
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={`url(#ringGrad${idx})`}
              strokeWidth={spec.stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{ 
                transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
                cursor: 'pointer',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
              onClick={(e) => onRingClick && onRingClick(idx, it, e)}
              onTouchEnd={(e) => onRingClick && onRingClick(idx, it, e)}
            />
          </g>
        );
      })}
      
      {/* Competition progress ring */}
      {competition && competitionParticipation && (() => {
        const radius = (size - ringSpecs[3].stroke) / 2 - ringSpecs[3].inset;
        const circumference = 2 * Math.PI * radius;
        
        // Ensure we have numbers, not strings
        const actual = Number(competitionActual) || 0;
        const target = Number(competition.target_quantity) || 1;
        const progress = Math.min(actual / target, 1);
        const offset = circumference * (1 - progress);
        
        console.log('Competition ring calculation:', {
          competitionActual: actual,
          targetQuantity: target,
          progress,
          circumference,
          offset,
          originalActual: competitionActual,
          originalTarget: competition.target_quantity
        });
        
        return (
          <g className="activity-ring">
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#competitionGrad)"
              strokeWidth={ringSpecs[3].stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{ 
                transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
                cursor: 'pointer',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            />
          </g>
        );
      })()}
      
      
      {/* Center content */}
      <g className="activity-center-text">
        <circle cx={center} cy={center} r={50} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {competition && competitionParticipation && (
          <text 
            x={center} 
            y={center + 5} 
            textAnchor="middle" 
            className="prize-text"
            style={{
              filter: competitionParticipation ? 'none' : 'blur(3px)',
              transition: 'filter 0.5s ease'
            }}
          >
            £{parseFloat(competition.prize).toFixed(0)}
          </text>
        )}
      </g>
    </svg>
  );
}

const ringColors = [
  { color: ['#00f5ff', '#0099ff'] }, // electric cyan
  { color: ['#ff0080', '#ff4081'] }, // hot pink
  { color: ['#00ff88', '#00e676'] }, // neon green
];

function App() {
  // Authentication state
  const [, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [day, setDay] = useState('Mon');
  const [session, setSession] = useState('Lunch');
  const [weather, setWeather] = useState('Rain');
  const [waiter, setWaiter] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [actuals, setActuals] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [waiters, setWaiters] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRing, setSelectedRing] = useState(null);
  
  // Competition state
  const [competition, setCompetition] = useState(null);
  const [competitionParticipation, setCompetitionParticipation] = useState(false);
  const [competitionActual, setCompetitionActual] = useState(0);
  const [competitionModalOpen, setCompetitionModalOpen] = useState(false);

  // Determine base URL: local dev vs. production
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://waiter-backend-futa.onrender.com'  // Your Render backend
    : 'http://localhost:5000';  // Local for dev (existing recommendations API)
  
  // New authentication backend URL
  const authBaseUrl = isProduction 
    ? 'https://waiter-backend-futa.onrender.com'
    : 'http://localhost:5001';  // New authentication backend

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          
          // Check if token is expired (basic check)
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenPayload.exp && tokenPayload.exp < currentTime) {
              // Token is expired
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setLoading(false);
              return;
            }
          } catch (e) {
            // Invalid token format
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            return;
          }
          
          // Set user immediately for better UX
          setUser(user);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Optionally validate token with backend (non-blocking)
          try {
            const response = await axios.get(`${authBaseUrl}/api/auth/validate`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.data.valid) {
              // Token is invalid, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            // If backend is not available, keep the user logged in
            // This prevents logout when backend is down
            console.log('Token validation failed (backend may be down):', error);
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [authBaseUrl]);

  // Authentication handlers
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setWaiter(userData.username); // Set waiter name from user
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setWaiter(userData.username); // Set waiter name from user
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setWaiter('');
    setRecommendations([]);
    setCompetition(null);
    setCompetitionParticipation(false);
  };

  // Fetch waiter names from backend on mount
  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/waiters`);
        setWaiters(response.data.waiters);
        if (response.data.waiters.length > 0) {
          setWaiter(response.data.waiters[0]); // Default to first waiter
        }
      } catch (err) {
        console.error('Error fetching waiters:', err);
      }
    };
    fetchWaiters();
  }, [baseUrl]);

  // Fetch competition status when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCompetitionStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${authBaseUrl}/api/competition/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.competition) {
          setCompetition(response.data.competition);
          setCompetitionParticipation(response.data.participation.is_participating);
          setCompetitionActual(response.data.participation.actual_quantity || 0);
        }
      } catch (err) {
        console.error('Error fetching competition status:', err);
        // If 401, user might not be authenticated properly
        if (err.response?.status === 401) {
          console.log('User not authenticated for competition status');
        }
      }
    };

    fetchCompetitionStatus();
  }, [isAuthenticated, authBaseUrl]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRecommendations([]);
    setActuals({});
    try {
      const response = await axios.post(`${baseUrl}/api/recommend-categories`, {
        day,
        session,
        weather,
        waiter,
      });
      setRecommendations(response.data.recommendations);
      setSidebarOpen(false); // Close sidebar after successful submission
    } catch (err) {
      setError('Error fetching recommendations: ' + err.message);
      alert(error);
    }
  };

  const handleActualChange = (idx, value) => {
    setActuals((prev) => ({ ...prev, [idx]: value }));
  };

  const handleCompetitionParticipation = async (participate) => {
    console.log('Setting competition participation to:', participate);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${authBaseUrl}/api/competition/participate`, {
        participate
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCompetitionParticipation(participate);
      setCompetitionModalOpen(false);
      console.log('Participation updated successfully');
    } catch (err) {
      console.error('Error updating participation:', err);
      setError('Error updating participation: ' + err.response?.data?.error);
    }
  };

  const handleCompetitionActualChange = async (value) => {
    console.log('Updating competition actual to:', value);
    setCompetitionActual(value);
    
    // Update progress on backend
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${authBaseUrl}/api/competition/progress`, {
        actualQuantity: value
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Competition progress updated successfully');
    } catch (err) {
      console.error('Error updating competition progress:', err);
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Waiter FM...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="App">
      {/* Logout Button */}
      <button 
        className="logout-button"
        onClick={handleLogout}
        title="Logout"
      >
        👋 Logout
      </button>
      
      <header className="App-header">
        <div className="card">
          {recommendations.length > 0 && (
            <div className="activity-rings-container">
              {(() => {
                const items = recommendations.slice(0, 3).map((rec, idx) => {
                  const predictedInt = Math.round(rec.predicted_quantity);
                  const actual = actuals[idx] !== undefined ? Number(actuals[idx]) : predictedInt;
                  const { color } = ringColors[idx % ringColors.length];
                  return {
                    category: rec.category,
                    target: rec.target_quantity,
                    predicted: predictedInt,
                    actual,
                    color,
                    idx,
                  };
                });
                
                const getWeatherIcon = (weather) => {
                  switch(weather) {
                    case 'Rain': return '🌧️';
                    case 'Wind': return '💨';
                    case 'Cloud': return '☁️';
                    case 'Sunny': return '☀️';
                    default: return '☀️';
                  }
                };
                
                return (
                  <>
                    <div className="rings-header">
                      <div className="greeting">
                        <span className="greeting-text">Hi</span>
                        <span className="waiter-name">{waiter}</span>
                      </div>
                      <div className="weather-icon">
                        {getWeatherIcon(weather)}
                      </div>
                    </div>
                    <div 
                      className="rings-layout"
                      onClick={() => setSelectedRing(null)}
                      onTouchEnd={() => setSelectedRing(null)}
                    >
                      <ActivityRings 
                        items={items} 
                        onRingClick={(idx, item, event) => {
                          event.stopPropagation();
                          setSelectedRing(idx);
                        }}
                        competition={competition}
                        competitionParticipation={competitionParticipation}
                        competitionActual={competitionActual}
                      />
                      <div className="right-panel">
                        {selectedRing !== null ? (
                          <div className="selected-ring-info">
                            <div className="selected-header">
                              <div 
                                className="selected-dot" 
                                style={{ background: `linear-gradient(135deg, ${items[selectedRing].color[0]}, ${items[selectedRing].color[1]})` }} 
                              />
                              <span className="selected-category">{items[selectedRing].category}</span>
                            </div>
                            <div className="target-display">
                              <span className="target-label">Actual</span>
                              <span 
                                className="target-number"
                                style={{ 
                                  color: items[selectedRing].color[0],
                                  textShadow: `0 0 20px ${items[selectedRing].color[0]}`,
                                  filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                                }}
                              >
                                {items[selectedRing].actual}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="targets-table">
                            <div className="table-header">
                              <span className="header-text">TARGETS</span>
                            </div>
                            {items.map((it, i) => (
                              <div key={i} className="target-row">
                                <div 
                                  className="target-dot" 
                                  style={{ background: `linear-gradient(135deg, ${it.color[0]}, ${it.color[1]})` }} 
                                />
                                <span className="target-category">{it.category}</span>
                                <span 
                                  className="target-value"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${it.color[0]}, ${it.color[1]})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    textShadow: 'none'
                                  }}
                                >
                                  {it.target}
                                </span>
                              </div>
                            ))}
                            {competition && (
                              <div 
                                className="target-row competition-row"
                                onClick={() => setCompetitionModalOpen(true)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="target-dot competition-dot" />
                                <span className="target-category">Special Competition</span>
                                {!competitionParticipation && (
                                  <span className="notification-badge">1</span>
                                )}
                                {competitionParticipation && (
                                  <div className="competition-right-section">
                                    <span 
                                      className="target-value competition-target"
                                      style={{ 
                                        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        textShadow: 'none'
                                      }}
                                    >
                                      {Number(competition.target_quantity)}
                                    </span>
                                    <span className="participation-status participating">✅</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="actuals-inline">
                      {items.map((it, i) => (
                        <div key={i} className="actuals-chip">
                          <span className="chip-dot" style={{ background: `linear-gradient(135deg, ${it.color[0]}, ${it.color[1]})` }} />
                          <span className="chip-label">{it.category}</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="actual-input chip-input"
                            value={(() => {
                              const val = actuals[it.idx] ?? it.predicted;
                              return val === 0 ? '' : val;
                            })()}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === '' || /^\d+$/.test(val)) {
                                handleActualChange(it.idx, val === '' ? '' : parseInt(val, 10));
                              }
                            }}
                          />
                        </div>
                      ))}
                      {competition && competitionParticipation && (
                        <div className="actuals-chip competition-chip">
                          <span className="chip-dot" style={{ background: 'linear-gradient(135deg, #ffd700, #ffed4e)' }} />
                          <span className="chip-label">{competition.item}</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="actual-input chip-input"
                            value={competitionActual === 0 ? '' : competitionActual}
                            placeholder=""
                            onChange={e => {
                              const val = e.target.value;
                              // Allow any input, but only update state with valid numbers
                              if (val === '' || /^\d+$/.test(val)) {
                                const numValue = val === '' ? 0 : parseInt(val, 10);
                                if (!isNaN(numValue)) {
                                  handleCompetitionActualChange(numValue);
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="details-section">
                      <button 
                        className="details-button"
                        onClick={() => setDetailsOpen(!detailsOpen)}
                      >
                        <span className="details-icon">{detailsOpen ? '▼' : '▶'}</span>
                        <span className="details-text">Details</span>
                      </button>
                      {detailsOpen && (
                        <div className="rings-stats">
                          {items.map((it, i) => (
                            <div key={i} className="rings-row">
                              <div className="rings-row-left">
                                <span className="row-category">{it.category}</span>
                              </div>
                              <div className="rings-row-right">
                                <div className="row-stat">
                                  <span className="stat-label">Predicted</span>
                                  <span className="stat-value">{it.predicted}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
        
        {/* Sidebar Toggle Button */}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sidebar-toggle-icon">{sidebarOpen ? '✕' : '⚙️'}</span>
          <span className="sidebar-toggle-text">Your Goals</span>
        </button>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-content">
            <form onSubmit={handleSubmit}>
              <h1>Settings</h1>
              <div className="form-group">
                <label>Day:</label>
                <select value={day} onChange={(e) => setDay(e.target.value)}>
                  <option value="Mon">Mon</option>
                  <option value="Tue">Tue</option>
                  <option value="Wed">Wed</option>
                  <option value="Thu">Thu</option>
                  <option value="Fri">Fri</option>
                  <option value="Sat">Sat</option>
                  <option value="Sun">Sun</option>
                </select>
              </div>
              <div className="form-group">
                <label>Session:</label>
                <select value={session} onChange={(e) => setSession(e.target.value)}>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Weather:</label>
                <select value={weather} onChange={(e) => setWeather(e.target.value)}>
                  <option value="Rain">Rain</option>
                  <option value="Wind">Wind</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Sunny">Sunny</option>
                </select>
              </div>
              <div className="form-group">
                <label>Waiter:</label>
                <select value={waiter} onChange={(e) => setWaiter(e.target.value)}>
                  {waiters.map((w, idx) => (
                    <option key={idx} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <button type="submit">Get Recommendations</button>
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Competition Modal */}
        {competitionModalOpen && competition && (
          <div className="modal-overlay" onClick={() => setCompetitionModalOpen(false)}>
            <div className="competition-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🏆 Special Competition</h3>
                <button 
                  className="modal-close"
                  onClick={() => setCompetitionModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <div className="competition-info">
                  <div className="info-row">
                    <span className="info-label">Item:</span>
                    <span className="info-value">{competition.item}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Target:</span>
                    <span className="info-value">{competition.target_quantity} units</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Prize:</span>
                    <span className="info-value">£{parseFloat(competition.prize).toFixed(2)}</span>
                  </div>
                  <div className="info-description">
                    <span className="info-label">Description:</span>
                    <p className="info-text">{competition.description}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    className="participate-button"
                    onClick={() => handleCompetitionParticipation(true)}
                  >
                    🚀 Participate
                  </button>
                  <button 
                    className="ignore-button"
                    onClick={() => handleCompetitionParticipation(false)}
                  >
                    ❌ Ignore
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;