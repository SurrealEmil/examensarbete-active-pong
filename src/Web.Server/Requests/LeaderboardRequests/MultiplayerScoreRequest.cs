using System.ComponentModel.DataAnnotations;

namespace Web.Server.Requests.LeaderboardRequests
{
    public class MultiplayerScoreRequest
    {
        [Required]
        public ScoreLeaderboardRequest Player1 { get; set; } = null!; // Required

        public ScoreLeaderboardRequest? Player2 { get; set; } // Optional (nullable)
    }
}
