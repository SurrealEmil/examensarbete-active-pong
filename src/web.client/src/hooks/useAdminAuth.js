import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('AuthToken='))
      ?.split('=')[1];

    if (!token) {
      setIsAdmin(false);
      setAuthChecked(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      const role = decoded[roleClaim];

      console.log("Decoded Role:", role);

      setIsAdmin(role === "Admin");
    } catch (e) {
      console.error("Token decode error", e);
      setIsAdmin(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  return { isAdmin, authChecked };
};

export default useAdminAuth;
