using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Web.Server.Requests.LeaderboardRequests;

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

            entry.SetUsername(user.Username); // Ensure Username is set from UserId

            await _leaderboardService.AddEntry(entry);
            _userService.RemoveUserFromActiveList(user.UserId);

            return Ok(new { message = "Score submitted successfully!" });
        }

        // Submit scores for multiplayer games (Player 1 required, Player 2 optional)
        [HttpPost("submit-multiplayer")]
        public async Task<IActionResult> SubmitScores([FromBody] MultiplayerScoreRequest request)
        {
            if (request.Player1 == null)
                return BadRequest("Player 1 is required.");

            // 🔹 Process Player 1
            var user1 = await _userService.GetUserById(request.Player1.UserId);
            if (user1 == null) return BadRequest($"User {request.Player1.UserId} not found.");

            request.Player1.SetUsername(user1.Username);
            await _leaderboardService.AddEntry(request.Player1);
            _userService.RemoveUserFromActiveList(user1.UserId);

            // 🔹 Process Player 2 (if provided)
            if (request.Player2 != null)
            {
                var user2 = await _userService.GetUserById(request.Player2.UserId);
                if (user2 == null) return BadRequest($"User {request.Player2.UserId} not found.");

                request.Player2.SetUsername(user2.Username);
                await _leaderboardService.AddEntry(request.Player2);
                _userService.RemoveUserFromActiveList(user2.UserId);
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

        [HttpGet("{gameMode}/all-players")]

        public async Task<IActionResult> GetAllPlayers(string gameMode)
        {
            var allPlayers = await _leaderboardService.GetAllPlayers(gameMode);
            if (allPlayers == null || !allPlayers.Any())
                return NotFound(new { message = "No players found for this game mode." });

            return Ok(allPlayers);
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
