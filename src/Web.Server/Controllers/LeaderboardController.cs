using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Web.Server.Controllers
{
    public class LeaderboardController : Controller
    {
        private readonly ILeaderboardService _leaderboardService;
        private readonly IUserService _userService;

        public LeaderboardController(ILeaderboardService leaderboardService, IUserService userService)
        {
            _leaderboardService = leaderboardService;
            _userService = userService;
        }

        // Submit score (called when game ends)
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitScore([FromBody] ScoreRequest request)
        {
            var user = await _userService.GetUserById(request.UserId);
            if (user == null) return BadRequest("User not found.");

            await _leaderboardService.AddEntry(request.UserId, user.Username, request.Score, request.GameMode);

            // Remove user from active list (game is finished)
            _userService.RemoveUserFromActiveList(user.UserId);

            return Ok(new { message = "Score submitted successfully!" });
        }

        // Get top 10 scores for a game mode
        [HttpGet("{gameMode}/top10")]
        public async Task<IActionResult> GetTop10Scores(string gameMode)
        {
            var topPlayers = await _leaderboardService.GetTop10(gameMode);
            return Ok(topPlayers);
        }

        // Get player's best score and rank
        [HttpGet("{gameMode}/player/{userId}")]
        public async Task<IActionResult> GetPlayerBestScore(string gameMode, string userId)
        {
            var playerEntry = await _leaderboardService.GetPlayerBestScore(gameMode, userId);
            if (playerEntry == null) return NotFound("No games played yet.");
            return Ok(playerEntry);
        }

        //TODO: Move to DTOs folder
        public class ScoreRequest
        {
            public string UserId { get; set; }  // User submitting the score
            public int Score { get; set; }  // Score achieved
            public string GameMode { get; set; }  // The game mode played
        }
    }
}
