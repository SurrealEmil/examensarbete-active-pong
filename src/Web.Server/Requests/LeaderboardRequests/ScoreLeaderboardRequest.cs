namespace Web.Server.Requests.LeaderboardRequests
{
    public class ScoreLeaderboardRequest
    {
        public string UserId { get; set; }  // User submitting the score
        public int Score { get; set; }  // Score achieved
        public string GameMode { get; set; }  // The game mode played
    }
}
