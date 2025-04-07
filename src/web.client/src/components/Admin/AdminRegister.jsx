import { useState, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AdminRegister.css';
import { useNavigate } from 'react-router-dom';

const AdminRegister = ({ users, setUsers, onSwitch }) => {
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Delete user by ID
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and their high score?')) return;
  
    try {
      // Delete user
      await axios.delete(`${API_BASE_URL}/user/${userId}`);
  
      // Delete leaderboard score (if any)
      await axios.delete(`${API_BASE_URL}/leaderboard/Pong/${userId}`);
  
      // Update local users state
      setUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete user or score');
    }
  };

  // Filter and sort users based on search and order
  const filteredAndSortedUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    const matching = users.filter((user) =>
      user.username.toLowerCase().includes(lowerSearch)
    );

    const nonMatching = users.filter(
      (user) => !user.username.toLowerCase().includes(lowerSearch)
    );

    const sortFn = (a, b) =>
      sortOrder === 'asc'
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);

    return [...matching.sort(sortFn), ...nonMatching.sort(sortFn)];
  }, [users, searchTerm, sortOrder]);

  return (
    <div className="register-wrapper">
        <div className="register-users-toggle-top">
            <button onClick={onSwitch}>Leaderboard</button>
        </div>
        
        <div className="register-users-home-top">
            <button onClick={() => navigate('/')}>Home</button>
        </div>

        <div className="register-users-logo" onClick={() => navigate('/')}>
            <img className="register-users-logo-img" src="/img/logo2.png" alt="Logo" />
        </div>

        <div className="register-users-title">
            Registered Users
        </div>

      <input
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="register-users-search"
      />

      {filteredAndSortedUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="register-users-table-container">
          <table className="register-users-table">
            <thead>
              <tr>
                <th
                  onClick={() =>
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Username {sortOrder === 'asc' ? '▲' : '▼'}
                </th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
          </table>

          <div className="register-users-scroll">
            <table className="register-users-table">
              <tbody>
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.username || 'Unnamed'}</td>
                    <td>{user.email}</td>
                    <td>
                    {!user.isAdmin ? (
                        <button
                        className="register-users-delete"
                        onClick={() => handleDelete(user.userId)}
                        >
                        Delete
                        </button>
                    ) : (
                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>Admin</span>
                    )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegister;