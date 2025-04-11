import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import "./UserProfile.css"
import API_BASE_URL from '../../config/apiConfig'

interface UserProfileProps {}

interface UserProfile {
    username: string;
    email: string;
    qrCodeIdentifier?: string;
    gameStats: {
        gameMode: string;
        rank: number;
        bestScore: number;
    }[];
}

const UserProfile: React.FC<UserProfileProps> = () => {
    const [serverMessage, setServerMessage] = useState("Loading...");
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const navigate = useNavigate()

    // 🔹 Fetch User Profile (After Login)
    const fetchProfile = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/profile`, { withCredentials: true, });
        console.log("Profile Data:", response.data);
        setProfile(response.data);
    } catch (error:any) {
        console.error("Profile Fetch Error:", error.response?.data || error.message);
        setServerMessage("Failed to fetch profile")
    }
};

useEffect(() => {
    fetchProfile()
}, [])



return (
    <div className="black-wrapper">
    <div className="user-profile-wrapper">
        {profile ? (
            <div className="profile-contet">
                {/* <h3>User Profile:</h3>
                <p>Username: {profile.username}</p>
                <p>Email: {profile.email}</p> */}
                <h3>User </h3>
                <p>{profile.username}</p>



                <div className="qr-code-container"> 
                    {profile.qrCodeIdentifier ? (
                        <QRCodeCanvas className="qr-code" value={profile.qrCodeIdentifier} size={400}/>
                    ) : (
                        <p>No QR Code Available</p>
                    )}
                </div>
                <h4>Game Stats:</h4>
                <ul>
                    {profile.gameStats && profile.gameStats.length > 0 ? (
                        profile.gameStats.map((stat, index) => (
                        <li key={index}>
                            {stat.rank === 0 && stat.bestScore === 0 ? (
                            // Zero matches played => show only game mode
                            <span>{stat.gameMode}</span>
                            ) : (
                            // At least one match => show rank/best score
                            <>
                              <div>Rank: {stat.rank}</div>
                              <div>Best Score: {stat.bestScore}</div>
                            </>
                            )}
                        </li>
                        ))
                    ) : (
                        <li>NO GAME STATS AVAILABLE</li>
                    )}
                </ul>

                <button 
                    className="back-button"
                    onClick={() => navigate('/login')}
                >
                    Back
                </button>
            </div>
        ) : (
            <p>{serverMessage}</p>
        )}
    </div>
    </div>
    );
};

export default UserProfile;