# ActivePong API Documentation

## 🔹 Authentication Endpoints  

> ⚠️ **Note:** Register and Login have response bodies, but they are only used in Swagger.

### 📝 POST /api/auth/register  
Registers a new user and returns a **JWT token**.

#### Request Body:
```json
{
  "username": "TestUser",
  "email": "test@example.com"
}
```

#### Response:
- **200 OK** – User registered and logged in successfully.
```json
{
  "message": "User registered and logged in successfully",
  "userId": "12345",
  "token": "your-jwt-token"
}
```
- **400 Bad Request** – Username and email are required.

#### Axios Example:
```javascript
axios.post(`${API_BASE_URL}/api/auth/register`, {
    username: "TestUser",
    email: "test@example.com"
});
```

---

### 📝 POST /api/auth/login  
Authenticates a user and returns a **JWT token**.

#### Request Body:
```json
{
  "email": "test@example.com"
}
```

#### Response:
- **200 OK** – Login successful.
```json
{
  "message": "Login successful",
  "token": "your-jwt-token"
}
```
- **401 Unauthorized** – Invalid credentials.

#### Axios Example:
```javascript
axios.post(`${API_BASE_URL}/api/auth/login`, {
    email: "test@example.com"
});
```

---

### 📝 POST /api/auth/logout  
Logs out the authenticated user by **expiring the auth token cookie**.

#### Response:
- **200 OK** – User logged out successfully.

#### Axios Example:
```javascript
const logout = async () => {
    await axios.post(`${API_BASE_URL}/api/auth/logout`);
};
```

---

## 🔹 User Endpoints  

### 📝 GET /api/user/profile  
Retrieves the authenticated user's profile. **Requires authentication.**

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
axios.get(`${API_BASE_URL}/api/user/profile`, { withCredentials: true });
```

---

### 📝 GET /api/user/id/{userId}  
Retrieves a user by their **ID**.

#### Request:
- **Method:** `GET`
- **URL:** `http://localhost:7070/api/user/id/{userId}`
- **Path Parameter:** `userId` (string) – The unique identifier of the user.

#### Response:
- **200 OK** – Returns user data.  
- **404 Not Found** – User not found.

#### Example Request (Axios):
```javascript
axios.get(`http://localhost:7070/api/user/id/12345`);
```

---

### 📝 GET /api/user/qr/{qrCode}  
Retrieves user information based on a **QR code**.

#### Request:
- **Method:** `GET`
- **URL:** `http://localhost:7070/api/user/qr/{qrCode}`
- **Path Parameter:** `qrCode` (string) – The unique identifier assigned to a user.

#### Response:
- **200 OK** – Returns user data.  
- **404 Not Found** – No user found with the provided QR code.

#### Example Request (Axios):
```javascript
axios.get(`http://localhost:7070/api/user/qr/402874`);
```

---

### 📝 GET /api/user/all  
Retrieves **all registered users**.

#### Response:
- **200 OK** – Returns a list of users.

#### Example Request (Axios):
```javascript
axios.get(`http://localhost:7070/api/user/all`);
```

---

### 📝 PUT /api/user/update  
Updates the authenticated user's profile. **Requires authentication.**

#### Request Body:
```json
{
  "username": "NewUsername",
  "email": "new@example.com"
}
```

#### Response:
- **200 OK** – User updated successfully.
- **401 Unauthorized** – User is not logged in.
- **404 Not Found** – User not found.

#### Example Request (Axios):
```javascript
axios.put(`${API_BASE_URL}/api/user/update`, {
    username: "NewUsername",
    email: "new@example.com"
}, { withCredentials: true });
```

---

### 📝 DELETE /api/user/{userId}  
Deletes a user by their **ID**.

#### Request:
- **Method:** `DELETE`
- **URL:** `http://localhost:7070/api/user/{userId}`
- **Path Parameter:** `userId` (string) – The ID of the user to delete.

#### Response:
- **200 OK** – User deleted successfully.

#### Example Request (Axios):
```javascript
axios.delete(`http://localhost:7070/api/user/12345`);
```

---

## 🔹 Leaderboard Endpoints  

### 📝 POST /api/leaderboard/submit-multiplayer  
Submits **scores for one or two players** in a match.

#### Request:
- **Method:** `POST`
- **URL:** `http://localhost:7070/api/leaderboard/submit-multiplayer`
- **Headers:**  
  - `accept: */*`  
  - `Content-Type: application/json`  
- **Request Body:**  
  - `player1` (object) – Required. Contains `userId`, `bestScore`, and `gameMode`.  
  - `player2` (object or null) – Optional. Can be `null` if only one player is submitting a score.  

#### Example Request Body (Single Player):
```json
{
  "player1": {
    "userId": "12345",
    "bestScore": 9800,
    "gameMode": "Pong"
  },
  "player2": null
}
```

#### Example Request Body (Two Players):
```json
{
  "player1": {
    "userId": "12345",
    "bestScore": 9800,
    "gameMode": "Pong"
  },
  "player2": {
    "userId": "67890",
    "bestScore": 7500,
    "gameMode": "Pong"
  }
}
```

#### Response:
- **200 OK** – Scores submitted successfully.  
- **400 Bad Request** – Invalid input.  
- **500 Internal Server Error** – Server issue.

#### Example Request (Axios, Single Player):
```javascript
axios.post(`${API_BASE_URL}/api/leaderboard/submit-multiplayer`, {
    player1: {
        userId: "12345",
        bestScore: 9800,
        gameMode: "Pong"
    },
    player2: null
});
```

---

### 📝 GET /api/leaderboard/{gameMode}/top-players  
Retrieves the **top 10 players** for a specific game mode.

#### Response:
- **200 OK** – Returns the top 10 players.
- **404 Not Found** – No players found.

#### Example Request (Axios):
```javascript
axios.get(`http://localhost:7070/api/leaderboard/Pong/top-players`);
```

---

### 📝 GET /api/leaderboard/{gameMode}/all-players  
Retrieves **all players** for a specific game mode.

#### Response:
- **200 OK** – Returns all players.
- **404 Not Found** – No players found.

#### Example Request (Axios):
```javascript
axios.get(`http://localhost:7070/api/leaderboard/Pong/all-players`);
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
