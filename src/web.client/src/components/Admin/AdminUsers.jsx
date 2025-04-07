import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminRegister from './AdminRegister';
import AdminLeaderboard from './AdminLeaderboard';
import API_BASE_URL from '../../config/apiConfig';
import useAdminAuth from '../../hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const { isAdmin, authChecked } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const [view, setView] = useState('register');
  const [users, setUsers] = useState([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      await axios.post(`${API_BASE_URL}/auth/login`, { email }, { withCredentials: true });
      
    } catch (err) {
      setLoginError(err.response?.data || 'Login failed');
    }
  };

  useEffect(() => {
    if (!authChecked || !isAdmin) return;

    const fetchData = async () => {
      try {
        const [usersResponse, leaderboardResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/user/all`),
          axios.get(`${API_BASE_URL}/leaderboard/Pong/all-players`)
        ]);
        setUsers(usersResponse.data);
        setLeaderboardUsers(leaderboardResponse.data);
      } catch (err) {
        setError(err.response?.data || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked, isAdmin]);

  if (!authChecked) return <div>Checking authentication...</div>;

  if (!isAdmin) {
    return (
      <div className="login-wrapper">
        <img className="logo" src="/img/logo2.png" alt="Logo" />
        <div className="login-text">Admin Login Required</div>
        <form onSubmit={handleLogin}>
          <div className="e-mail">
            <input
              type="email"
              value={email}
              placeholder="Admin E-mail"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="continue-button-container">
            <button className="continue-button" type="submit">
              Login
            </button>
          </div>
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="admin-users-wrapper">
      <div className="view-toggle">
        <button
          className={view === 'register' ? 'active' : ''}
          onClick={() => setView('register')}
        >
          Registry
        </button>
        <button
          className={view === 'leaderboard' ? 'active' : ''}
          onClick={() => setView('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      <div className="view-content">
        {view === 'register' ? (
          <AdminRegister
            users={users}
            setUsers={setUsers}
            onSwitch={() => setView('leaderboard')}
          />
        ) : (
          <AdminLeaderboard
            users={leaderboardUsers}
            setUsers={setLeaderboardUsers}
            onSwitch={() => setView('register')}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
