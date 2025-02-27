import React, { useEffect, useState } from 'react';
/* import { useEffect } from 'react' */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartScreen from './components/StartScreen/StartScreen';
import PongGame from './components/PongGame/PongGame';
import Leaderboard from './components/UI/Leaderboard'
import ConnectOverlay from './components/UI/ConnectOverlay';

const playersData = [
  { id: 1, rank: 1, name: 'Arnold swh', score: 8179872 },
  { id: 2, rank: 2, name: 'Betty White', score: 7924943},
  { id: 3, rank: 3, name: 'Lara Croft', score: 2804},
  { id: 4, rank: 4, name: 'Bruce L', score: 8179872 },
  { id: 5, rank: 5, name: 'Jean-Claude', score: 7924943},
  { id: 6, rank: 6, name: 'Robo Rider', score: 2804},
  { id: 7, rank: 7, name: 'Jackie Chan', score: 8179872 },
  { id: 8, rank: 8, name: 'Pamela Andersson', score: 7924943},
  { id: 9, rank: 9, name: 'Clint East', score: 2804},
  { id: 10, rank: 10, name: 'Sylvester Stall', score: 2804},
]

const App = () => {
    const [serverMessage, setServerMessage] = useState("Loading...");

    useEffect(() => {
        fetch("https://localhost:7070/api/ping")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setServerMessage(data.message))
            .catch((error) => {
                console.error("Error fetching API:", error);
                setServerMessage("Failed to connect to server");
            });
    }, []);
  
/*   useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "c") {  // Change "c" to any key you prefer
        console.log("🔄 Keyboard shortcut pressed! Connecting new Joy-Cons...");
        connectNewJoyCons();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []); */


  return (
    <>
      <ConnectOverlay/>
    <Router>
      <div className="App">
         <h2>Backend Response:</h2>
         <p>{serverMessage}</p>

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