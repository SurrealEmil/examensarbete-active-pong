using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserLeaderboardDTOs
{
    public class GameStatsDto
    {
        public string GameMode { get; set; } = "N/A";
        public int Rank { get; set; } = 0;
        public int BestScore { get; set; } = 0;

        // Constructor for automatic mapping
        public GameStatsDto(GameStats gameStats)
        {
            GameMode = gameStats.GameMode;
            Rank = gameStats.Rank;
            BestScore = gameStats.BestScore;
        }
    }
}
