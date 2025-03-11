using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Web.Server.DTOs;

namespace Web.Server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        //private readonly IJwtService _jwtService;

        public AuthController(IUserService userService /*IJwtService jwtService*/)
        {
            _userService = userService;
            //_jwtService = jwtService;
        }

        // ✅ Register a New User
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email))
                return BadRequest("Username and email are required.");

            var newUser = await _userService.RegisterUser(request.Username, request.Email);
            return Ok(new { message = "User registered successfully", userId = newUser.UserId });
        }

        // ✅ Login and Get JWT Token
        //[HttpPost("login")]
        //public async Task<IActionResult> Login([FromBody] LoginRequest request)
        //{
        //    var user = await _userService.GetUserByEmail(request.Email);
        //    if (user == null)
        //        return Unauthorized("Invalid credentials.");

        //    //string token = _jwtService.GenerateToken(user);
        //    return Ok(new { message = "Login successful", /*token */});
        //}

        // ✅ Logout (Client-Side)
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "User logged out successfully" }); // Client handles logout
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
    }
}
