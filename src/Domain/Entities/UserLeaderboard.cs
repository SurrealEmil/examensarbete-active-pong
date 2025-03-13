using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UserLeaderboard
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string QrCodeIdentifier { get; set; } = string.Empty;

        public List<GameStats> GameStats { get; set; } = new();
    }

    public class GameStats
    {
        public string GameMode { get; set; } = "N/A";
        public int Rank { get; set; } = 0;
        public int BestScore { get; set; } = 0;
    }
}
