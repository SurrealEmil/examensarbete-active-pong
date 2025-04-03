using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Web.Server.Requests.UserRequests;

namespace Web.Server.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IUserLeaderboardService _userLeaderboardService;

        public UserController(IUserService userService, IUserLeaderboardService userLeaderboardService)
        {
            _userService = userService;
            _userLeaderboardService = userLeaderboardService;
        }

        // Get a User Profile (Requires Auth)
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            string token = Request.Cookies["AuthToken"]; // Read from cookie
            if (string.IsNullOrEmpty(token))
                return Unauthorized("Missing token.");

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid token.");

            var userProfile = await _userLeaderboardService.GetUserLeaderboardInfo(userId);
            if (userProfile == null) return NotFound("User not found.");

            return Ok(userProfile);
        }

        // Get a User by ID
        [HttpGet("id/{userId}")]
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

        [Authorize(Roles = "Admin")]
        // Get All Users
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        // Update a User (Requires Auth)
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
