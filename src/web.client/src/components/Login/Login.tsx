import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import "./Login.css"
import API_BASE_URL from '../../config/apiConfig'

interface LoginProps {

}

const Login: React.FC<LoginProps> = () => {
    const [username, setUsername] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [profile, setProfile] = useState<string>('')
    const [user, setUser] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const navigate = useNavigate() // For navigation after login

/////////////////////////////////////////////////////
//////////////////REGISTER USER//////////////////////
/////////////////////////////////////////////////////



// 🔹 Login User
const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) {
        alert("Please enter an email.");
        return;
    }

    setLoading(true)
    setError('')

    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, 
            {email,});
        console.log("Login Success:", response.data);
        setUser(response.data);
        await fetchProfile(); // Fetch profile after login
        navigate('/userprofile')
    } catch (error: any) {
        console.error("Login Error:", error.response?.data || error.message);
    } finally {
        setLoading(false)
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
    } catch (error: any) {
        console.error("Profile Fetch Error:", error.response?.data || error.message);
    }
};
   // 🔹 Logout User
   const logout = async () => {
    try {
        await axios.post(`${API_BASE_URL}/auth/logout`);
        console.log("Logout Successful");
        setUser('');
        setProfile(''); // Clear profile on logout
    } catch (error:any) {
        console.error("Logout Error:", error.response?.data || error.message);
    }
};

 

    return(
<div>
    <div className="login-wrapper">
    <div>
        <img className="logo" /* style={{width: '220px'}} */src="/img/logo2.png" alt="" />
    </div>
    <div className="login-text">
        Login to get started
    </div>
      
    <form onSubmit={login}>
 {/*        <div className="nickname">
            <label></label>
            <input  
                type="nickname"
                value={username}
                placeholder='Nickname'
                onChange={(e) => setUsername(e.target.value)}
                required
            />
        </div> */}
        <div className='e-mail'>
            <label></label>
            <input 
                type="email" 
                value={email}
                placeholder='E-mail'
                onChange={(e) => setEmail(e.target.value)}
                required
            />
        </div>
        <div className="continue-button-container">
            <button className="continue-button"
                type="submit">Continue
            </button>
        </div>
        <div className="sign-up-container">
            <p>Don't have an account</p>
            <a href="#" 
               className="sign-up-link" 
               onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
               }}>
               Sign up
            </a>
        </div>
    </form>
    </div>
</div>
)
}



export default Login