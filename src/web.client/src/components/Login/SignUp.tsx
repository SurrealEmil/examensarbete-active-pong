import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import "./SignUp.css"
import API_BASE_URL from '../../config/apiConfig'

interface SignUpProps {

}

const SignUp: React.FC<SignUpProps> = () => {
    const [username, setUsername] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [profile, setProfile] = useState<string>('')
    const [user, setUser] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const navigate = useNavigate() 

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!username || !email) {
            alert("Please enter both username and email.");
            return;
        }  
        e.preventDefault()
        setLoading(true)
        setError('')
        try {   
            const response = await axios.post(`${API_BASE_URL}/auth/register`,
            { username, email },
);
            console.log('Register Success:', response.data)
            setUser(response.data)
        
            /* await loginUser(email) */

            await fetchProfile()

            await navigate('/userprofile')

            
        } 
        catch (err) {
            console.error('Register failed:', err)
            setError('Register failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

  /*   const loginUser = async (email: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, 
                { email }, { withCredentials: true });
            console.log("Login Success:", response.data);
            setUser(response.data);
        } catch (error: any) {
            console.error("Login Error:", error.response?.data || error.message);
        }
    }; */

    // 🔹 Fetch User Profile (After signing up)
    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/profile`, 
                { withCredentials: true });
            console.log("Profile Data:", response.data);
            setProfile(response.data);
           
        } catch (error: any) {
            console.error("Profile Fetch Error:", error.response?.data || error.message);
        }
    };



return(
    <div>
    <div className="signup-parent">
        <div className="signup-sign-up-wrapper">
            <div>
                <img className="signup-logo" src="/img/logo2.png" alt="" />
            </div>
            <div className="signup-text">
                Sign up to get started
            </div>
          
            <form onSubmit={handleSignUp}>

            <div className="signup-nickname">
                
                <input  
                    type="nickname"
                    value={username}
                    placeholder='Nickname'
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className='signup-e-mail'>
                
                <input 
                    type="email" 
                    value={email}
                    placeholder='E-mail'
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="signup-signup-button-container">
                <button className="signup-signup-button"
                    type="submit">Sign up
                </button>
            </div>
            <div className="signup-login-container">
            <p>Already have an account</p>
            <a href="#" 
               className="signup-login-link" 
               onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
               }}>
               Log in
            </a>
        </div>
            
        </form>
        </div>
    </div>
    </div>
)
}

export default SignUp;