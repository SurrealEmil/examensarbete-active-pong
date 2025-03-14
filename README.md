# ActivePong API Documentation

## 🔹 Authentication Endpoints

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
- **200 OK**
```json
{
  "message": "User registered and logged in successfully",
  "userId": "12345",
  "token": "your-jwt-token"
}
```
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
- **200 OK**
```json
{
  "message": "Login successful",
  "token": "your-jwt-token"
}
```
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

## 🔹 Notes
- All endpoints require JSON payloads.
- Authentication endpoints return a **JWT token** for future requests.
- `GET /api/user/profile` requires authentication via the returned token.
- Use `withCredentials: true` if your API uses cookies for session management.

---
