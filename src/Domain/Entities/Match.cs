using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Match
    {
        private Guid _matchId;

        [JsonProperty("id")]
        public string MatchId => _matchId.ToString();

        public string PartitionKey => MatchId;

        public string EventId { get; private set; }
        public string GameModeId { get; private set; }
        public PlayerInfo Player1 { get; private set; }
        public PlayerInfo? Player2 { get; private set; }
        public string? WinnerId { get; private set; }
        public DateTime StartTime { get; private set; }
        public DateTime? EndTime { get; private set; }

        [JsonConstructor]
        private Match(string id, string eventId, string gameModeId, PlayerInfo player1, DateTime startTime)
        {
            _matchId = Guid.Parse(id);
            EventId = eventId;
            GameModeId = gameModeId;
            Player1 = player1;
            StartTime = startTime;
        }

        public Match(Guid matchId, string eventId, string gameModeId, PlayerInfo player1, DateTime startTime)
        {
            _matchId = matchId;
            EventId = eventId;
            GameModeId = gameModeId;
            Player1 = player1;
            StartTime = startTime;
        }

        public void AssignPlayer2(PlayerInfo player2)
        {
            if (Player2 == null) Player2 = player2;
        }

        public void EndMatch(string winnerId)
        {
            WinnerId = winnerId;
            EndTime = DateTime.UtcNow;
        }
    }
}
