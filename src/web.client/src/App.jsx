import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react'
import StartScreen from './components/StartScreen/StartScreen';
import PongGame from './components/PongGame/PongGame';
import PongGameTournament from './components/PongGame/PongGame-Tournament'
import Leaderboard from './components/StartScreen/Leaderboard'
import ConnectOverlay from './components/UI/ConnectOverlay';
import Lobby from './components/Lobby/Lobby'
import Login from './components/Login/Login'
import SignUp from './components/Login/SignUp'
import UserProfile from './components/Login/UserProfile'
import AdminRegister from './components/Admin/AdminRegister';
import AdminLeaderboard from './components/Admin/AdminLeaderboard';
import AdminUsers from './components/Admin/AdminUsers';

const AppContent = () => {
  const location = useLocation()

  useEffect(() => {
    const noCrtRoutes = ['/login', '/signup', '/userprofile', '/admin/users']

    const shouldDisableCrt = noCrtRoutes.some(route =>
      location.pathname.startsWith(route)
    )

    if (shouldDisableCrt){
      document.body.classList.add('no-crt')
    } else {
      document.body.classList.remove('no-crt')
    }
  }, [location])


  return (
    <>
      <ConnectOverlay/>
    
      <div className="App">
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/lobby" element={<Lobby />}/>
          <Route path="/pong" element={<PongGame />} />
          <Route path="/tournament" element={<PongGameTournament />}/>
          <Route path="/arcade" element={<div>Arcade Mode</div>} />
          <Route path="/party" element={<div>Party Mode</div>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/userprofile" element={<UserProfile/>}/>
          {/* <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/leaderboard/admin" element={<AdminLeaderboard />} /> */}
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;