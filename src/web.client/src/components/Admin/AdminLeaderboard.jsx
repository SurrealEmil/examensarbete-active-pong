import { useState, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AdminLeaderboard.css';
import { useNavigate } from 'react-router-dom';

const AdminLeaderboard = ({ users, setUsers, onSwitch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Delete user by ID
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/leaderboard/Pong/${userId}`);
      setUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete score');
    }
  };

  // Match-first search (sorted by rank)
  const filteredAndRankedUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    const matching = users.filter((user) =>
      user.username.toLowerCase().includes(lowerSearch)
    );

    const nonMatching = users.filter(
      (user) => !user.username.toLowerCase().includes(lowerSearch)
    );

    return [...matching, ...nonMatching];
  }, [users, searchTerm]);

  return (
    <div className="leaderboard-wrapper">
        <div className="leaderboard-users-toggle-top">
            <button onClick={onSwitch}>Registry</button>
        </div>

        <div className="leaderboard-users-home-top">
            <button onClick={() => navigate('/')}>Home</button>
        </div>

        <div className="leaderboard-users-logo" onClick={() => navigate('/')}>
            <img className="leaderboard-users-logo-img" src="/img/logo2.png" alt="Logo" />
        </div>

        <div className="leaderboard-users-title">
            Pong Leaderboard
        </div>

      <input
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="leaderboard-users-search"
      />

      {filteredAndRankedUsers.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <div className="leaderboard-users-table-container">
          <table className="leaderboard-users-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
          </table>

          <div className="leaderboard-users-scroll">
            <table className="leaderboard-users-table">
              <tbody>
                {filteredAndRankedUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.rank}</td>
                    <td>{user.username || 'Unnamed'}</td>
                    <td>{user.bestScore}</td>
                    <td>
                      <button
                        className="leaderboard-users-delete"
                        onClick={() => handleDelete(user.userId)}
                      >
                        Delete
                      </button>
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

export default AdminLeaderboard;