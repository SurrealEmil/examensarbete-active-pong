using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Leaderboard
    {

        [JsonProperty("id")]
        public string LeaderboardId { get; private set; }

        [JsonProperty("GameModeId")]
        public string PartitionKey => GameModeId;

        public string GameModeId { get; private set; }
        public List<LeaderboardEntry> TopPlayers { get; private set; } = new();

        public Leaderboard(string leaderboardId, string gameModeId, List<LeaderboardEntry> topPlayers)
        {
            LeaderboardId = leaderboardId;
            GameModeId = gameModeId;
            TopPlayers = topPlayers ?? new List<LeaderboardEntry>();
        }
    }
}
