import React from 'react';
import './Leaderboard.css';





const getOrdinalSuffix = (rank) => {
  if (rank % 100 >= 11 && rank % 100 <= 13) {
    return `{rank}th`;
  }
  switch(rank % 10) {
    case 1: return `${rank}st`
    case 2: return `${rank}nd`
    case 3: return `${rank}rd`
    default: return `${rank}th`
  }
}


const Leaderboard = ({ players }) => {
  // players is expected to be an array of objects with keys: rank, name, and score
  return (
    <div className="leaderboard-container">
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
    </div>
  );
};

export default Leaderboard;