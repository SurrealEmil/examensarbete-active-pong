using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.LeaderboardDTOs
{
    public class LeaderboardResultDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int BestScore { get; set; }
        public int Rank { get; set; }
        public string GameMode { get; set; } = string.Empty;

        // Constructor for mapping Entity → DTO
        public LeaderboardResultDto(LeaderboardEntry entry)
        {
            UserId = entry.UserId;
            Username = entry.Username;
            BestScore = entry.BestScore;
            Rank = entry.Rank;
            GameMode = entry.GameMode;
        }
    }
}
