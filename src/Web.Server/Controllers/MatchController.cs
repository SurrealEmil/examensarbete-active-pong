using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.Server.Controllers
{
    [ApiController]
    [Route("api/matches")]
    public class MatchController : ControllerBase
    {
        private readonly IMatchService _matchService;
        private readonly IUserService _userService;

        public MatchController(IMatchService matchService, IUserService userService)
        {
            _matchService = matchService;
            _userService = userService;
        }

        // Create a new match
        [HttpPost]
        public async Task<IActionResult> CreateMatch([FromBody] CreateMatchRequest request)
        {
            var user = await _userService.GetUserByQrCode(request.QrCode);
            if (user == null) return BadRequest("User not found.");

            var match = await _matchService.CreateMatch(request.GameMode, user.UserId, user.Username);
            return Ok(match);
        }


        // Get match details
        [HttpGet("{matchId}")]
        public async Task<IActionResult> GetMatch(string matchId)
        {
            var match = await _matchService.GetMatchById(matchId);
            if (match == null) return NotFound("Match not found.");
            return Ok(match);
        }

        // Join match using QR Code
        [HttpPost("join")]
        public async Task<IActionResult> AssignPlayerToMatch([FromBody] AssignPlayerRequest request)
        {
            var user = await _userService.GetUserByQrCode(request.QrCode);
            if (user == null) return BadRequest("Invalid QR Code.");

            bool success = await _matchService.AssignPlayerToMatch(request.MatchId, user.UserId, user.Username);
            if (!success) return BadRequest("Match not found, full, or player already in match.");

            return Ok(new { message = "Player successfully joined the match!" });
        }


        // End match & declare winner
        [HttpPost("end")]
        public async Task<IActionResult> EndMatch([FromBody] EndMatchRequest request)
        {
            var match = await _matchService.EndMatch(request.MatchId, request.WinnerId);
            if (match == null) return BadRequest("Invalid match or winner ID.");
            return Ok(match);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMatches()
        {
            var matches = await _matchService.GetAllMatches();
            if (matches == null || matches.Count == 0)
                return NotFound("No matches found.");

            return Ok(matches);
        }


        //TODO: Move Request bodys
        public class CreateMatchRequest
        {
            public string GameMode { get; set; }
            public string QrCode { get; set; }

            public CreateMatchRequest(string gameMode, string qrCode)
            {
                GameMode = gameMode;
                QrCode = qrCode;
            }
        }

        public class AssignPlayerRequest
        {
            public string MatchId { get; set; }
            public string QrCode { get; set; }

            public AssignPlayerRequest(string matchId, string qrCode)
            {
                MatchId = matchId;
                QrCode = qrCode;
            }
        }

        public class EndMatchRequest
        {
            public string MatchId { get; set; }
            public string WinnerId { get; set; }

            public EndMatchRequest(string matchId, string winnerId)
            {
                MatchId = matchId;
                WinnerId = winnerId;
            }
        }


    }
}
