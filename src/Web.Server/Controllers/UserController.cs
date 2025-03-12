using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Web.Server.DTOs;

namespace Web.Server.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILeaderboardService _leaderboardService;

        public UserController(IUserService userService, ILeaderboardService leaderboardService)
        {
            _userService = userService;
            _leaderboardService = leaderboardService;
        }

        [Authorize] //  Requires valid token
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid token.");

            var user = await _userService.GetUserById(userId);
            if (user == null) return NotFound("User not found.");

            var playerStats = await _leaderboardService.GetPlayerBestScoreAcrossModes(userId);

            return Ok(new
            {
                Username = user.Username,
                Email = user.Email,
                QrCode = user.QrCodeIdentifier,
                Stats = playerStats ?? new LeaderboardEntry(userId, user.Username, 0, 0, "No games played yet")
            });
        }

        // Get a User by ID
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var user = await _userService.GetUserById(userId);
            return user != null ? Ok(user) : NotFound("User not found.");
        }

        // Get a User by QR Code
        [HttpGet("qr/{qrCode}")]
        public async Task<IActionResult> GetUserByQrCode(string qrCode)
        {
            var user = await _userService.GetUserByQrCode(qrCode);
            return user != null ? Ok(user) : NotFound("User not found.");
        }

        // Get All Users
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        // Update a User by ID
        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized("Invalid token");

            var updatedUser = await _userService.UpdateUser(userId, request.Username, request.Email);
            if (updatedUser == null)
                return NotFound("User not found");

            return Ok(new { message = "User updated successfully", updatedUser });
        }


        // Delete a User by ID
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            await _userService.DeleteUser(userId);
            return Ok(new { message = "User deleted successfully" });
        }
    }
}
