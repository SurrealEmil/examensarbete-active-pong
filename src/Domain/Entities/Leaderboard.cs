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
        private Guid _leaderboardId;

        [JsonProperty("id")]
        public string LeaderboardId => _leaderboardId.ToString();

        public string PartitionKey => GameModeId;

        public string GameModeId { get; private set; }
        public List<LeaderboardEntry> TopPlayers { get; private set; }

        public Leaderboard(Guid leaderboardId, string gameModeId, List<LeaderboardEntry> topPlayers)
        {
            _leaderboardId = leaderboardId;
            GameModeId = gameModeId;
            TopPlayers = topPlayers;
        }
    }
}
