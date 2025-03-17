using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.DTOs.LeaderboardDTOs
{
    public class LeaderboardEntryDto
    {
        public string UserId { get; set; } = string.Empty;
        public int BestScore { get; set; }
        public string GameMode { get; set; } = string.Empty;


        [JsonIgnore] // Prevents Username from being included in JSON requests
        public string Username { get; private set; } = string.Empty;

        // Ensure JSON deserialization works
        public LeaderboardEntryDto() { }

        // Constructor for Mapping Entity → DTO
        public LeaderboardEntryDto(Domain.Entities.LeaderboardEntry entry)
        {
            UserId = entry.UserId;
            BestScore = entry.BestScore;
            GameMode = entry.GameMode;
            Username = entry.Username; // Ensure Username is mapped
        }

    }
}
