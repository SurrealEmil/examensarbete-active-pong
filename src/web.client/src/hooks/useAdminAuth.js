import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
          withCredentials: true, // <- includes the HttpOnly cookie
        });

        // console.log("Profile response:", response.data);

        setIsAdmin(response.data.isAdmin === true);
      } catch (err) {
        console.error("Auth check failed", err.response?.data || err.message);
        setIsAdmin(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  return { isAdmin, authChecked };
};

export default useAdminAuth;
