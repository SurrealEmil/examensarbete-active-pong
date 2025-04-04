import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AdminRegister.css';

const AdminRegister = () => {
  const [rawUsers, setRawUsers] = useState([]); // original data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/user/all`);
        setRawUsers(response.data);
      } catch (err) {
        setError(err.response?.data || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete user by ID
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/user/${userId}`);
      setRawUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete user');
    }
  };

  // Filter and sort users based on search and order
  const filteredAndSortedUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
  
    const matching = rawUsers.filter((user) =>
      user.username.toLowerCase().includes(lowerSearch)
    );
  
    const nonMatching = rawUsers.filter(
      (user) => !user.username.toLowerCase().includes(lowerSearch)
    );
  
    const sortFn = (a, b) =>
      sortOrder === 'asc'
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
  
    return [...matching.sort(sortFn), ...nonMatching.sort(sortFn)];
  }, [rawUsers, searchTerm, sortOrder]);

  return (
    <div className="login-wrapper">
      <div>
        <img className="logo" src="/img/logo2.png" alt="Logo" />
      </div>

      <div className="login-text">Registered Users</div>

      {/* Search bar */}
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
      ) : filteredAndSortedUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="table-container">
          <table className="admin-user-table">
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

          <div className="table-scroll-container">
            <table className="admin-user-table">
              <tbody>
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.username || 'Unnamed'}</td>
                    <td>{user.email}</td>
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

export default AdminRegister;
