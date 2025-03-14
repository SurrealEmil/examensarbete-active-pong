using Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Web.Server.Requests.LeaderboardRequests
{
    public class MultiplayerScoreRequest
    {
        [Required]
        public LeaderboardEntry Player1 { get; set; }  // Required
        public LeaderboardEntry? Player2 { get; set; } // Optional (nullable)
    }
}
