using Application.Interfaces;
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

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Get a User by ID
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var user = await _userService.GetUserById(userId);
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
