# ActivePong API Documentation

## 🔹 Authentication Endpoints

> ⚠️ **Note:** Register and Login have response bodies, but they are only used in Swagger.

### 📝 POST /api/user/register  
Registers a new user.

#### Request Body:
```json
{
  "username": "TestUser",
  "email": "test@example.com"
}
```

#### Response:
- **200 OK** (Handled in Swagger)
- **400 Bad Request** (Invalid input or email already in use)

#### Axios Example:
```javascript
axios.post(`${API_BASE_URL}/auth/register`, {
    username: "TestUser",
    email: "test@example.com"
});
```

---

### 📝 POST /api/user/login  
Authenticates a user.

#### Request Body:
```json
{
  "email": "test@example.com"
}
```

#### Response:
- **200 OK** (Handled in Swagger)
- **401 Unauthorized** (Invalid credentials)

#### Axios Example:
```javascript
axios.post(`${API_BASE_URL}/auth/login`, {
    email: "test@example.com"
});
```

---

### 📝 POST /api/user/logout  
Logs out the authenticated user.

#### Response:
- **200 OK** (Successfully logged out)

#### Axios Example:
```javascript
const logout = async () => {
    await axios.post(`${API_BASE_URL}/auth/logout`);
};
```

---

## 🔹 User Endpoints

### 📝 GET /api/user/profile  
Retrieves the authenticated user's profile.

#### Response:
- **200 OK**
```json
{
  "username": "TestUser",
  "email": "test@example.com",
  "qrCodeIdentifier": "123456",
  "gameStats": [
    {
      "gameMode": "Classic",
      "rank": 3,
      "bestScore": 2000
    }
  ]
}
```
- **401 Unauthorized** (User is not logged in)

#### Axios Example:
```javascript
axios.get(`${API_BASE_URL}/user/profile`);
```

---

## 🔹 Displaying QR Code in React

Your `qrCodeIdentifier` can be displayed as a **scannable QR code** in React using the `qrcode.react` package.

### **1. Install the QR Code Library**
Run this command to install the package:

```sh
npm install qrcode.react
```

### **2. Implement the QR Code in Your Component**
Modify your **React component** to display a **QR code** for the user:

```jsx
import { QRCodeCanvas } from "qrcode.react";

{profile && (
    <div>
        <h3>User Profile:</h3>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>

        <h4>QR Code:</h4>
        {profile.qrCodeIdentifier ? (
            <QRCodeCanvas value={profile.qrCodeIdentifier} size={150} />
        ) : (
            <p>No QR Code Available</p>
        )}

        <h4>Game Stats:</h4>
        <ul>
            {profile.gameStats.map((stat, index) => (
                <li key={index}>
                    <strong>{stat.gameMode}</strong> - Rank: {stat.rank}, Best Score: {stat.bestScore}
                </li>
            ))}
        </ul>
    </div>
)}
```

### **How This Works**
✅ **`QRCodeCanvas` Component** – Renders a scannable QR code using the user's `qrCodeIdentifier`.  
✅ **Dynamic Rendering** – If no `qrCodeIdentifier` exists, it shows `No QR Code Available`.  
✅ **Customizable Size** – Adjust `size={150}` to make it larger or smaller.

---

## 🔹 Notes
- All endpoints require JSON payloads.
- Authentication endpoints return a **JWT token** for future requests.
- `GET /api/user/profile` requires authentication via the returned token.
- Use `withCredentials: true` if your API uses cookies for session management.

---
