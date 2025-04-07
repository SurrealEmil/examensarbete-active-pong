import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import "./Login.css"
import API_BASE_URL from '../../config/apiConfig'

interface LoginProps {

}

const Login: React.FC<LoginProps> = () => {
    /* const [username, setUsername] = useState<string>('') */
    const [email, setEmail] = useState<string>('')
    const [profile, setProfile] = useState<string>('')
    const [user, setUser] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const navigate = useNavigate() // For navigation after login


/////////////////////////////////////////////////////
//////////////////LOGIN USER//////////////////////
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
<div className="login-parent">
    <div className="login-login-wrapper">
        <div>
            <img className="login-logo" src="/img/logo2.png" alt="" />
        </div>
        <div className="login-login-text">
            Login to get started
        </div>
      
        <form onSubmit={login}>

        <div className='login-e-mail'>
            
            <input 
                type="email" 
                value={email}
                placeholder='E-mail'
                onChange={(e) => setEmail(e.target.value)}
                required
            />
        </div>
        <div className="login-continue-button-container">
            <button className="login-continue-button"
                type="submit">Continue
            </button>
        </div>
        <div className="login-sign-up-container">
            <p>Don't have an account</p>
            <a href="#" 
               className="login-sign-up-link" 
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