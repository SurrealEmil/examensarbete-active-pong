using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserLeaderboardDTOs
{
    public class UserLeaderboardDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string QrCodeIdentifier { get; set; } = string.Empty;
        public List<GameStatsDto> GameStats { get; set; } = new();

        // Constructor for automatic mapping
        public UserLeaderboardDto(UserLeaderboard userLeaderboard)
        {
            Username = userLeaderboard.Username;
            Email = userLeaderboard.Email;
            QrCodeIdentifier = userLeaderboard.QrCodeIdentifier;
            GameStats = userLeaderboard.GameStats
                .Select(e => new GameStatsDto(e))
                .ToList();
        }
    }
}
