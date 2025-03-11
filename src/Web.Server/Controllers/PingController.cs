using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.Server.Controllers
{
    [ApiController]
    [Route("api/ping")]
    [Authorize(Roles = "Admin")]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Pong from the backend!" });
        }
    }
}
