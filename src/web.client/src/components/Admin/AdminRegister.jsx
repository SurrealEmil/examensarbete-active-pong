import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AdminRegister.css';

const AdminRegister = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Sorting function
  const sortUsers = (users, order) => {
    return [...users].sort((a, b) =>
      order === 'asc'
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username)
    );
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/user/all`);
        const sortedUsers = sortUsers(response.data, sortOrder);
        setUsers(sortedUsers);
      } catch (err) {
        setError(err.response?.data || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sortOrder]); // re-sort on sortOrder change

  // Delete user by ID
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/user/${userId}`);
      setUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete user');
    }
  };

  return (
    <div className="login-wrapper">
      <div>
        <img className="logo" src="/img/logo2.png" alt="Logo" />
      </div>

      <div className="login-text">Registered Users</div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : users.length === 0 ? (
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
                {users.map((user) => (
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
