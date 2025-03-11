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

        [JsonProperty("id")]
        public string MatchId { get; private set; }

        [JsonProperty("MatchId")]
        public string PartitionKey => MatchId;

        public string GameMode { get; private set; }
        public PlayerInfo Player1 { get; private set; }
        public PlayerInfo? Player2 { get; private set; }
        public string? WinnerId { get; private set; }
        public DateTime StartTime { get; private set; }
        public DateTime? EndTime { get; private set; }

        public Match(string matchId, string gameMode, PlayerInfo player1, DateTime startTime)
        {
            MatchId = matchId;
            GameMode = gameMode;
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
