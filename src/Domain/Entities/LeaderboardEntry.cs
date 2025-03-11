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
        public int BestScore { get; private set; }
        public int Rank { get; private set; }

        public LeaderboardEntry(string userId, string username, int bestScore, int rank)
        {
            UserId = userId;
            Username = username;
            BestScore = bestScore;
            Rank = rank;
        }
    }
}
