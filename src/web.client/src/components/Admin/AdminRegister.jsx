import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';
import './AdminRegister.css'; // create this to match Login.css styling

const AdminRegister = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/user/all`);
        setUsers(response.data);
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
      setUsers((prev) => prev.filter((user) => user.id !== userId));
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
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || 'Unnamed'}</td>
                <td>{user.email}</td>
                <td>{user.score}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRegister;
