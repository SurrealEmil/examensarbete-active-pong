import { useEffect, useState } from 'react'
import './Leaderboard.css';
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../../config/apiConfig';
import { motion, AnimatePresence } from 'framer-motion'
import useAutoReturnToStart from '../../utils/useAutoReturnToStart';


 




const getOrdinalSuffix = (rank) => {
  if (rank % 100 >= 11 && rank % 100 <= 13) {
    return `${rank}th`;
  }
  switch (rank % 10) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }

  
};


const Leaderboard = () => {
  
  useAutoReturnToStart('/')
  const location = useLocation()
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false);

  

  const [players, setPlayers] = useState(location.state?.players || []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)

    }, 10000)
    return () => clearTimeout(timer)
  }, [])


    
    useEffect(() => {
      const fetchLeaderboard = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/leaderboard/Pong/all-players`);
          const playersData = response.data;
    
          // Sort by score and assign ranks
          playersData.sort((a, b) => b.bestScore - a.bestScore);
          const top10 = playersData.slice(0, 10)

          top10.forEach((player, index) => {
            player.rank = index + 1
          })
         
    
          // Convert to format used in the table
          const leaderboardReady = top10.map((p) => ({
            id: p.userId,
            name: p.username,
            score: p.bestScore,
            rank: p.rank,
          }));
    
          setPlayers(leaderboardReady);
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error.response?.data || error.message);
        }
      };
    
      // Use passed data if available, otherwise fetch
      if (location.state?.players && location.state.players.length) {
        const leaderboardReady = location.state.players.map((p, index) => ({
          id: p.userId || index,
          name: p.username || p.name || 'Unknown',
          score: p.bestScore || p.score || 0,
          rank: p.rank || index + 1,
        }));
        setPlayers(leaderboardReady);
      } else {
        fetchLeaderboard();
      }
    }, [location.state]);
    
  // players is expected to be an array of objects with keys: rank, name, and score
  return (
    <AnimatePresence mode="wait" onExitComplete={() => navigate('/')}>
      {!isExiting && (
        <motion.div className="leaderboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
     
      <h2>HIGH SCORES</h2>
      <div className="table-wrapper">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th className="rank-column">Rank</th>
            <th className="name-column">Name</th>
            <th className="score-column">Score</th>
          </tr>
        </thead>
        <tbody>
          {players && players.length ? (
            players.map((player, index) => (
              <tr key={player.id || index} className={player.rank === 1 ? 'first-place' : ''}>
                <td className="rank-column">{getOrdinalSuffix(player.rank)}</td>
                <td className="name-column">{player.name}</td>
                <td className="score-column"> {player.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No players found</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Leaderboard;