import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartScreen from "./components/StartScreen/StartScreen";
import PongGame from "./components/PongGame/PongGame";
import Leaderboard from "./components/UI/Leaderboard";
import ConnectOverlay from "./components/UI/ConnectOverlay";
import axios from "axios"; // Import Axios
import API_BASE_URL from "./config/apiConfig"; // Import API Base URL"
import { QRCodeCanvas } from "qrcode.react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const playersData = [
    { id: 1, rank: 1, name: "Arnold swh", score: 8179872 },
    { id: 2, rank: 2, name: "Betty White", score: 7924943 },
    { id: 3, rank: 3, name: "Lara Croft", score: 2804 },
    { id: 4, rank: 4, name: "Bruce L", score: 8179872 },
    { id: 5, rank: 5, name: "Jean-Claude", score: 7924943 },
    { id: 6, rank: 6, name: "Robo Rider", score: 2804 },
    { id: 7, rank: 7, name: "Jackie Chan", score: 8179872 },
    { id: 8, rank: 8, name: "Pamela Andersson", score: 7924943 },
    { id: 9, rank: 9, name: "Clint East", score: 2804 },
    { id: 10, rank: 10, name: "Sylvester Stall", score: 2804 },
];
console.log("App component is rendering!");
const App = () => {
    const [serverMessage, setServerMessage] = useState("Loading....");
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState(""); // Input for Register
    const [email, setEmail] = useState(""); // Input for Register & Login

    // 🔹 NEW: Create connection state for SignalR
    const [connection, setConnection] = useState(null);

    // 1️⃣ On Mount: Start the SignalR connection
    useEffect(() => {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/leaderboardhub`, {
          withCredentials: true, // Required for sending cookies!
        })
        .configureLogging(LogLevel.Information) // optional
        .build();

      newConnection.start()
        .then(() => {
          console.log("Connected to SignalR!");
          setConnection(newConnection);
        })
        .catch((err) => console.error("SignalR Connection Error:", err));
    }, []);

    // 2️⃣ Listen for SignalR events (once `connection` is established)
    useEffect(() => {
      if (connection) {
        // When the Leaderboard is updated on the server
        connection.on("ReceiveLeaderboardUpdate", () => {
          console.log("Leaderboard updated via SignalR. Let's fetch new data!");
          // You can either update local state or re-fetch your leaderboard or profile
          fetchProfile(); 
        });
      }
    }, [connection]);

    // 🔹 Ping Backend to Test Connection
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/ping`)
            .then((response) => setServerMessage(response.data.message))
            .catch((error) => {
                console.error("Error fetching API:", error);
                setServerMessage("Failed to connect to server");
            });
    }, []);

    // 🔹 Register User
    const register = async () => {
        if (!username || !email) {
            alert("Please enter both username and email.");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username,
                email,
            });
            console.log("Register Success:", response.data);
            setUser(response.data);
            fetchProfile(); // Fetch profile after registration
        } catch (error) {
            console.error("Register Error:", error.response?.data || error.message);
        }
    };

    // 🔹 Login User
    const login = async () => {
        if (!email) {
            alert("Please enter an email.");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
            });
            console.log("Login Success:", response.data);
            setUser(response.data);
            fetchProfile(); // Fetch profile after login
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
        }
    };

    // 🔹 Logout User
    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`);
            console.log("Logout Successful");
            setUser(null);
            setProfile(null); // Clear profile on logout
        } catch (error) {
            console.error("Logout Error:", error.response?.data || error.message);
        }
    };

    // 🔹 Fetch User Profile (After Login)
    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/profile`, {
                withCredentials: true, // Required for sending cookies!
            });
            console.log("Profile Data:", response.data);
            setProfile(response.data);
        } catch (error) {
            console.error("Profile Fetch Error:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <ConnectOverlay />
            <Router>
                <div className="App">
                    <h2>Backend Response:</h2>
                    <p>{serverMessage}</p>

                    {/* 🔹 Input Fields for Register/Login */}
                    <div>
                        <h3>Register</h3>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={register}>Register</button>
                    </div>

                    <div>
                        <h3>Login</h3>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={login}>Login</button>
                    </div>

                    <button onClick={logout}>Logout</button>

                    {/* 🔹 Display User Profile */}
                    {profile && (
                        <div>
                            <h3>User Profile:</h3>
                            <p>Username: {profile.username}</p>
                            <p>Email: {profile.email}</p>
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
                                        {stat.gameMode} - Rank: {stat.rank}, Best Score: {stat.bestScore}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Routes>
                        <Route path="/" element={<StartScreen />} />
                        <Route path="/pong" element={<PongGame />} />
                        <Route path="/arcade" element={<div>Arcade Mode</div>} />
                        <Route path="/party" element={<div>Party Mode</div>} />
                        <Route path="/leaderboard" element={<Leaderboard players={playersData} />} />
                    </Routes>
                </div>
            </Router>
        </>
    );
};

export default App;
