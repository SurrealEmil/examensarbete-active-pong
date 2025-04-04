import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AdminLeaderboard.css';

const AdminLeaderboard = () => {
  const [rawUsers, setRawUsers] = useState([]); // original leaderboard data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/leaderboard/Pong/all-players`);
        setRawUsers(response.data);
      } catch (err) {
        setError(err.response?.data || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Delete user by ID
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/leaderboard/Pong/${userId}`);
      setRawUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete score');
    }
  };

  // Match-first search (sorted by rank)
  const filteredAndRankedUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    const matching = rawUsers.filter((user) =>
      user.username.toLowerCase().includes(lowerSearch)
    );

    const nonMatching = rawUsers.filter(
      (user) => !user.username.toLowerCase().includes(lowerSearch)
    );

    return [...matching, ...nonMatching];
  }, [rawUsers, searchTerm]);

  return (
    <div className="login-wrapper">
      <div>
        <img className="logo" src="/img/logo2.png" alt="Logo" />
      </div>

      <div className="login-text">Pong Leaderboard</div>

      <input
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="user-search"
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : filteredAndRankedUsers.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <div className="table-container">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
          </table>

          <div className="table-scroll-container">
            <table className="admin-user-table">
              <tbody>
                {filteredAndRankedUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.rank}</td>
                    <td>{user.username || 'Unnamed'}</td>
                    <td>{user.bestScore}</td>
                    <td>
                      <button
                        className="delete-button"
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
