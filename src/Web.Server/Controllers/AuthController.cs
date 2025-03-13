using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Web.Server.Requests.AuthRequests;

namespace Web.Server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;

        public AuthController(IUserService userService, IJwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }

        // 🔹 Register and Get JWT Token
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email))
                return BadRequest("Username and email are required.");

            // Register the user
            var newUser = await _userService.RegisterUser(request.Username, request.Email);

            // Generate and set JWT token
            string token = _jwtService.GenerateToken(newUser);
            SetAuthTokenCookie(token);

            return Ok(new
            {
                message = "User registered and logged in successfully",
                userId = newUser.UserId,
                token
            });
        }

        // 🔹 Login and Get JWT Token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
                return Unauthorized("Invalid credentials.");

            string token = _jwtService.GenerateToken(user);
            SetAuthTokenCookie(token);

            return Ok(new { message = "Login successful", token });
        }

        // 🔹 Logout (Expire Token)
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            ExpireAuthTokenCookie();
            return Ok(new { message = "User logged out successfully" });
        }

        // 🔹 Helper Methods for Managing Auth Token Cookies
        private void SetAuthTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,                        // Prevents JavaScript access
                Secure = true,                          // Requires HTTPS
                SameSite = SameSiteMode.Strict,         // Prevents CSRF attacks
                Expires = DateTime.UtcNow.AddHours(1)   // Token expiration
            };

            Response.Cookies.Append("AuthToken", token, cookieOptions);
        }

        private void ExpireAuthTokenCookie()
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(-1) // Expire immediately
            };

            Response.Cookies.Append("AuthToken", "", cookieOptions);
        }
    }
}
