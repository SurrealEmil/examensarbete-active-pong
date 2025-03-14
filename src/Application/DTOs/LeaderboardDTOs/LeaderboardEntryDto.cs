using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.LeaderboardDTOs
{
    public class LeaderboardEntryDto
    {
        public string UserId { get; set; } = string.Empty;
        public int BestScore { get; set; }
        public string GameMode { get; set; } = string.Empty;

        // Constructor for Mapping Entity → DTO
        public LeaderboardEntryDto(Domain.Entities.LeaderboardEntry entry)
        {
            UserId = entry.UserId;
            BestScore = entry.BestScore;
            GameMode = entry.GameMode;
        }
    }
}
