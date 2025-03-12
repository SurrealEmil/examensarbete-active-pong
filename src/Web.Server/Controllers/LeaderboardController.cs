using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Web.Server.Controllers
{
    [Route("api/leaderboard")]
    [ApiController]
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
        public async Task<IActionResult> SubmitScore([FromBody] LeaderboardEntry entry)
        {
            var user = await _userService.GetUserById(entry.UserId);
            if (user == null) return BadRequest("User not found.");

            // Submit the entry to the leaderboard (Rank is assigned automatically)
            await _leaderboardService.AddEntry(entry);

            // Remove user from active list (game is finished)
            _userService.RemoveUserFromActiveList(user.UserId);

            return Ok(new { message = "Score submitted successfully!" });
        }

        // Get top 10 scores for a game mode
        [HttpGet("{gameMode}/top-players")]
        public async Task<IActionResult> GetTopPlayers(string gameMode)
        {
            var topPlayers = await _leaderboardService.GetTopPlayers(gameMode);
            if (topPlayers == null || !topPlayers.Any())
                return NotFound(new { message = "No players found for this game mode." });

            return Ok(topPlayers);
        }

        [HttpGet("player/{userId}/best-score")]
        public async Task<IActionResult> GetPlayerBestScoreAcrossModes(string userId)
        {
            var playerEntry = await _leaderboardService.GetPlayerBestScoreAcrossModes(userId);
            if (playerEntry == null) return NotFound(new { message = "No games played yet." });

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
