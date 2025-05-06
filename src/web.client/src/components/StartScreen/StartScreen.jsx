import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartScreen.css';
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from 'framer-motion'


const gameModes = [
  {
    label: 'QUICK GAME',
    route: '/pong',
    description: [''],
    showRegistration: false
  },
  {
    label: 'TOURNAMENT',
    route: '/tournament',
    description: []
  },
  {
    label: 'PARTY',
    route: '/pong',
    description: [''],
    showRegistration: false
  }
];



// Each 'section' has exactly 4 items.
const adminMenus = {
  main: ['Users', 'Settings', 'Modes', 'Exit'],
  users: ['Registry', 'Leaderboard', 'Blank', 'Back'],
  settings: ['Audio', 'Controls', 'Debug', 'Back'],
  modes: ['QUICK GAME', 'TOURNAMENT', 'PARTY', 'Back']
};

const StartScreen = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
 
  
  useEffect(() => {
    if (!adminOpen) {
    const timer = setTimeout(() => {
      setIsExiting(true)

    }, 20000)
    return () => clearTimeout(timer)
  }
  }, [adminOpen])
  
  const [adminActiveSection, setAdminActiveSection] = useState('main');
  const [adminSelectedIndex, setAdminSelectedIndex] = useState(0);

  // The selected mode (persisted in localStorage)
  const [selectedMode, setSelectedMode] = useState(null);

  // On mount, get from localStorage (if any)
  useEffect(() => {
    const savedMode = localStorage.getItem('selectedGameMode');
    let initialMode

    if (savedMode) {
      initialMode= JSON.parse(savedMode);
    } else {
      initialMode = gameModes.find(mode => mode.label === 'TOURNAMENT')
    }

    setSelectedMode(initialMode)
  }, []);

  // Whenever selectedMode changes, store it
  useEffect(() => {
    if (selectedMode) {
      localStorage.setItem('selectedGameMode', JSON.stringify(selectedMode));
    }
    if (!videoRef.current) return;
    const needsPause = ['QUICK GAME', 'PARTY'].includes(selectedMode?.label);
  if (needsPause) {
    videoRef.current.pause();
  } else {
    // if you want it to restart when you go back to Tournament
    videoRef.current.play();
  }

  }, [selectedMode]);

  // Keydown for arrow selection & Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (adminOpen) {
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setAdminSelectedIndex((prev) => (prev > 0 ? prev - 1 : 3));
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setAdminSelectedIndex((prev) => (prev < 3 ? prev + 1 : 0));
        } else if (e.key === 'Enter' || e.key === ' ') {
          handleAdminEnter();
        }
        return;
      } 

      if (e.key === 'Enter' && selectedMode) {
          if (['QUICK GAME', 'PARTY'].includes(selectedMode.label)){
            navigate('/lobby');
          } else {
            navigate(selectedMode.route);
       
        }
      }
    
  };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminOpen, selectedMode, navigate]);


  const handleAdminEnter = () => {
    const items = adminMenus[adminActiveSection];
    const choice = items[adminSelectedIndex];

    if (adminActiveSection === 'main') {
      switch (adminSelectedIndex) {
        case 0: // "Users"
          navigate('/admin/users');
          break;
        case 1: // "Settings"
          setAdminActiveSection('settings');
          setAdminSelectedIndex(0);
          break;
        case 2: // "Modes"
          setAdminActiveSection('modes');
          setAdminSelectedIndex(0);
          break;
        case 3: // "Exit"
          setAdminOpen(false);
          setAdminActiveSection('main');
          setAdminSelectedIndex(0);
          break;
        default:
          break;
      }
    // } else if (adminActiveSection === 'users') {
    //   switch (adminSelectedIndex) {
    //     case 0:
    //       navigate('/register/admin');
    //       break;
    //     case 1:
    //       navigate('/leaderboard/admin');
    //       break;
    //     case 2:
    //       console.log('Blank clicked');
    //       break;
    //     case 3: // Back
    //       setAdminActiveSection('main');
    //       setAdminSelectedIndex(0);
    //       break;
    //     default:
    //       break;
    //   }
    } else if (adminActiveSection === 'settings') {
      switch (adminSelectedIndex) {
        case 0:
          console.log('Audio clicked');
          break;
        case 1:
          console.log('Controls clicked');
          break;
        case 2:
          console.log('Debug clicked');
          break;
        case 3: // Back
          setAdminActiveSection('main');
          setAdminSelectedIndex(0);
          break;
        default:
          break;
      }
    } else if (adminActiveSection === 'modes') {
      switch (adminSelectedIndex) {
        case 1: // QUICK GAME
        case 0: // TOURNAMENT
        case 2: // PARTY
          // find the chosen game mode
          const selected = gameModes.find((m) => m.label === choice);
          setSelectedMode(selected || null);

          // close
          setAdminOpen(false);
          setAdminActiveSection('main');
          setAdminSelectedIndex(0);
          break;
        case 3: // Back
          setAdminActiveSection('main');
          setAdminSelectedIndex(0);
          break;
        default:
          break;
      }
    }
  };

  // Toggle menu
  const toggleAdminDropdown = () => {
    if (adminOpen) {
      setAdminOpen(false);
      setAdminActiveSection('main');
      setAdminSelectedIndex(0);
    } else {
      setAdminOpen(true);
      setAdminActiveSection('main');
      setAdminSelectedIndex(0);
    }
  };

  const renderAdminMenuItems = () => {
    const items = adminMenus[adminActiveSection];
    const topItems = items.slice(0, 3);
    const bottomItem = items[3];
  
    return (
      <div className="menu-list">
        <div className="menu-top">
          {topItems.map((item, i) => {
            const selected = i === adminSelectedIndex;
            return (
              <div
                key={item}
                className={`menu-item ${selected ? 'selected' : ''}`}
                onMouseEnter={() => setAdminSelectedIndex(i)}
                onClick={() => {
                  setAdminSelectedIndex(i);
                  handleAdminEnter();
                }}
              >
                <div
                  className="pong-ball"
                  style={{ opacity: selected ? 1 : 0 }}
                ></div>
                {item}
              </div>
            );
          })}
        </div>
        <div className="menu-bottom">
          {(() => {
            const i = 3;
            const selected = i === adminSelectedIndex;
            return (
              <div
                key={bottomItem}
                className={`menu-item ${selected ? 'selected' : ''}`}
                onMouseEnter={() => setAdminSelectedIndex(i)}
                onClick={() => {
                  setAdminSelectedIndex(i);
                  handleAdminEnter();
                }}
              >
                <div
                  className="pong-ball"
                  style={{ opacity: selected ? 1 : 0 }}
                ></div>
                {bottomItem}
              </div>
            );
          })()}
        </div>
      </div>
    );
  };
  

  return (
    <AnimatePresence mode="wait" onExitComplete={() => navigate('/leaderboard')}>
      {!isExiting && (
        <motion.div
          className="start-screen-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 10 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
  
        <video 
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="background-video">
          <source src="/img/pong-background-2.mov" type="video/mp4" />
        </video>
      
      <div className="admin-button" onClick={toggleAdminDropdown}>
     
        ADMIN
      </div>

      {/* Dropdown */}
      {adminOpen && (
        <div className="admin-dropdown">
          {renderAdminMenuItems()}
        </div>
      )}

      {/* Title */}
      <h1 className="title">
        <span className="active">ACTIVE</span>
        <span className="pong">PONG</span>
      </h1>
      <div>
      <h2 className="selected-mode">{selectedMode?.label}</h2>
      
      </div>
      {/* Selected Mode (Display as rules) */}
      {selectedMode ? (
          
           ['QUICK GAME','PARTY'].includes(selectedMode.label) ? (
            <div className="startscreen-under-construction">
              <img src="./img/under-construction.png" alt="" />
              <h2>🚧 Site Under Construction 🚧</h2>
              <ul>
                {selectedMode.description
              .filter(rule => rule.trim() !== '')    // remove blank strings
              .map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))
            }
              </ul>
            </div>
          ) : (
            <div className="old-mode-info-container">
              <div className="qr-code">
                <QRCode value="https://activepong.azurewebsites.net/signup" size={190} />
              </div>
              <div className="startscreen-text">
                <p>Register and scan your QR code to jump into the action</p>
                <ul>
                  {selectedMode.description.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
                <div className="qr-scan">
                  <img src="./img/qr-scan.png" alt="" />
                </div>  
            </div>
        )
      ) : (
        
        <div className="mode-info">
          <h2>No mode selected</h2>
          <p>Please open ADMIN to choose a game mode.</p>
        </div>
      )}
      <div className="startscreen-note-text">Note: This game is only available on PC. For the best experience, please play it on a desktop or laptop computer.</div>
      <div className="enter-text">Press ENTER to play</div>
      <div className="startscreen-login-page" onClick={() => navigate('/login')}>
        Press here to login
      </div>
      
      <div className="footer">
        <img src="./img/logo.png" alt="Logo" />
        <p>2025 ACTIVE SOLUTION</p>
      </div>
    
    </motion.div>
  )}
</AnimatePresence>
);
}

export default StartScreen;
