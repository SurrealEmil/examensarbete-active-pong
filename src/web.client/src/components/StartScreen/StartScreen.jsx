import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from "react-qr-code";
import './StartScreen.css';
import PongBackground from './PongBackground';

const gameModes = [
  {
    label: 'QUICK GAME',
    route: '/pong',
    description: [
      'Start a standard match of Pong',
      'First player to 10 points wins'
    ]
  },
  {
    label: 'TOURNAMENT',
    route: '/pong',
    description: [
      'Welcome, Register and scan your QR code to jump into the action Rack up points through thrilling challenges. Win your way to the next round and dominate the competition.',
      'Follow on-screen instructions for match rules'
    ]
  },
  {
    label: 'PARTY',
    route: '/pong',
    description: [
      'Casual mode with power-ups and modifiers',
      'Different game-altering effects will appear',
      'Have fun and experiment with various playstyles'
    ]
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

  const [fadeClass, setFadeClass] = useState('fade-in');


  //useEffect(() => {
  //  const fadeOutTimer = setTimeout(() => {
  //    setFadeClass('fade-out');
  
  //    const navTimer = setTimeout(() => {
  //      navigate('/leaderboard');
  //    }, 500); // match fade-out CSS duration
  
  //    return () => clearTimeout(navTimer);
  //  }, 10000); // wait 2s before fading
  
  //  return () => clearTimeout(fadeOutTimer);
  //}, [navigate]);
  


  const [adminOpen, setAdminOpen] = useState(false);
  const [adminActiveSection, setAdminActiveSection] = useState('main');
  const [adminSelectedIndex, setAdminSelectedIndex] = useState(0);

  // The selected mode (persisted in localStorage)
  const [selectedMode, setSelectedMode] = useState(null);

  // On mount, get from localStorage (if any)
  useEffect(() => {
    const savedMode = localStorage.getItem('selectedGameMode');
    let initialMode = null;

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
  }, [selectedMode]);

  // Keydown for arrow selection & Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        toggleAdminDropdown(); // Open/close Admin menu with "A"
      }

      if (adminOpen) {
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setAdminSelectedIndex((prev) => (prev > 0 ? prev - 1 : 3));
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setAdminSelectedIndex((prev) => (prev < 3 ? prev + 1 : 0));
        } else if (e.key === 'Enter' || e.key === ' ') {
          handleAdminEnter();
        }
      } else {
        // If admin is NOT open, pressing Enter starts the game
        if (e.key === 'Enter' && selectedMode) {
          navigate('/lobby');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminOpen, adminActiveSection, adminSelectedIndex, selectedMode, navigate]);

  const handleAdminEnter = () => {
    const items = adminMenus[adminActiveSection];
    const choice = items[adminSelectedIndex];

    if (adminActiveSection === 'main') {
      switch (adminSelectedIndex) {
        case 0: // "Users"
          setAdminActiveSection('users');
          setAdminSelectedIndex(0);
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
    } else if (adminActiveSection === 'users') {
      switch (adminSelectedIndex) {
        case 0:
          console.log('Registry clicked');
          break;
        case 1:
          console.log('Leaderboard clicked');
          break;
        case 2:
          console.log('Blank clicked');
          break;
        case 3: // Back
          setAdminActiveSection('main');
          setAdminSelectedIndex(0);
          break;
        default:
          break;
      }
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

  // We separate top 3 items from 4th
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
    <div className={`start-screen-container ${fadeClass}`}>
      {/* ADMIN Button */}
      <div className='pong-background'>
        <PongBackground/> 
        </div>
      <div className="admin-button" onClick={toggleAdminDropdown}>
        {/* <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div> */}
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
        <div className="mode-info-container">
          
          <div className="rules">
            <ul>
              {selectedMode.description.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
          <div className="qr-container">
            <div className="qr-scan"><img src="./img/qr-scan-6.png" alt="" /></div>
            <div className="qr-code">
                <QRCode value="https://activepong.azurewebsites.net/login" size={128} />
            </div>
          </div>
          
        </div>
      ) : (
        
        <div className="mode-info">
          <h2>No mode selected</h2>
          <p>Please open ADMIN to choose a game mode.</p>
        </div>
      )}
      <div className="enter-text">Press ENTER to play</div>
      {/* Footer */}
      <div className="footer">
        <img src="./img/logo4.png" alt="Logo" />
        <p>2025 ACTIVE SOLUTION</p>
      </div>
    </div>
  );
};

export default StartScreen;
