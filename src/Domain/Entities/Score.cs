using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Score
    {
        private Guid _scoreId;

        [JsonProperty("id")]
        public string ScoreId => _scoreId.ToString();

        public string PartitionKey => MatchId;

        public string MatchId { get; private set; }
        public string UserId { get; private set; }
        public int ScoreValue { get; private set; }

        public Score(Guid scoreId, string matchId, string userId, int scoreValue)
        {
            _scoreId = scoreId;
            MatchId = matchId;
            UserId = userId;
            ScoreValue = scoreValue;
        }
    }
}
