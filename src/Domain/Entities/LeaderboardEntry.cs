using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class LeaderboardEntry
    {
        public string UserId { get; private set; }
        public string Username { get; private set; }
        public int BestScore { get; private set; } // Player's best score
        public int Rank { get; private set; } // Player's rank
        public string GameMode { get; private set; } // Track which game mode the score belongs to

        public LeaderboardEntry(string userId, string username, int bestScore, int rank, string gameMode)
        {
            UserId = userId;
            Username = username;
            BestScore = bestScore;
            Rank = rank;
            GameMode = gameMode;
        }

        public void UpdateScore(int newScore)
        {
            if (newScore > BestScore) // Only update if it's a better score
            {
                BestScore = newScore;
            }
        }

        public void UpdateRank(int newRank)
        {
            Rank = newRank; // Update rank when recalculating leaderboard
        }
    }
}
