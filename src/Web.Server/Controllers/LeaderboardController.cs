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

        // Submit a single-player score
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitScore([FromBody] LeaderboardEntry entry)
        {
            var user = await _userService.GetUserById(entry.UserId);
            if (user == null)
                return BadRequest("User not found.");

            entry.SetUsername(user.Username); // ✅ Ensure Username is set from UserId

            await _leaderboardService.AddEntry(entry);
            _userService.RemoveUserFromActiveList(user.UserId);

            return Ok(new { message = "Score submitted successfully!" });
        }

        // Submit scores for multiplayer games (supports one or two players)
        [HttpPost("submit-multiplayer")]
        public async Task<IActionResult> SubmitScores([FromBody] List<LeaderboardEntry?> entries)
        {
            if (entries == null || entries.Count == 0)
                return BadRequest("At least one score is required.");
            if (entries.Count > 2)
                return BadRequest("This endpoint supports up to two players per game.");

            foreach (var entry in entries.Where(e => e != null)) // ✅ Ignore null entries
            {
                var user = await _userService.GetUserById(entry.UserId);
                if (user == null)
                    return BadRequest($"User {entry.UserId} not found.");

                entry.SetUsername(user.Username);
                await _leaderboardService.AddEntry(entry);
                _userService.RemoveUserFromActiveList(user.UserId);
            }

            return Ok(new { message = "Scores submitted successfully!" });
        }

        // Get top 10 players for a specific game mode
        [HttpGet("{gameMode}/top-players")]
        public async Task<IActionResult> GetTopPlayers(string gameMode)
        {
            var topPlayers = await _leaderboardService.GetTopPlayers(gameMode);
            if (topPlayers == null || !topPlayers.Any())
                return NotFound(new { message = "No players found for this game mode." });

            return Ok(topPlayers);
        }

        // Get a player's best score across all game modes
        [HttpGet("player/{userId}/best-score")]
        public async Task<IActionResult> GetPlayerBestScoreAcrossModes(string userId)
        {
            var playerEntry = await _leaderboardService.GetPlayerBestScoreAcrossModes(userId);
            if (playerEntry == null)
                return NotFound(new { message = "No games played yet." });

            return Ok(playerEntry);
        }
    }
}
