using Application.DTOs.LeaderboardDTOs;
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
        public async Task<IActionResult> SubmitScore([FromBody] ScoreLeaderboardRequest request)
        {
            var user = await _userService.GetUserById(request.UserId);
            if (user == null)
                return BadRequest("User not found.");

            // Pass Username to the Service
            var leaderboardEntry = await _leaderboardService.AddEntry(user.UserId, user.Username, request.BestScore, request.GameMode);

            return Ok(new { message = "Score submitted successfully!", entry = leaderboardEntry });
        }


        // Submit scores for multiplayer games (Player 1 required, Player 2 optional)
        [HttpPost("submit-multiplayer")]
        public async Task<IActionResult> SubmitScores([FromBody] MultiplayerScoreRequest request)
        {
            if (request.Player1 == null)
                return BadRequest("Player 1 is required.");

            var responses = new List<LeaderboardEntryDto>();

            // 🔹 Process Player 1
            var user1 = await _userService.GetUserById(request.Player1.UserId);
            if (user1 == null) return BadRequest($"User {request.Player1.UserId} not found.");

            var entry1 = await _leaderboardService.AddEntry(user1.UserId, user1.Username, request.Player1.BestScore, request.Player1.GameMode);
            responses.Add(entry1);

            // 🔹 Process Player 2 (if provided)
            if (request.Player2 != null)
            {
                var user2 = await _userService.GetUserById(request.Player2.UserId);
                if (user2 == null) return BadRequest($"User {request.Player2.UserId} not found.");

                var entry2 = await _leaderboardService.AddEntry(user2.UserId, user2.Username, request.Player2.BestScore, request.Player2.GameMode);
                responses.Add(entry2);
            }

            return Ok(new { message = "Scores submitted successfully!", entries = responses });
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
