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

        [JsonProperty("id")]
        public string ScoreId { get; private set; }

        [JsonProperty("MatchId")]
        public string PartitionKey => MatchId;

        public string MatchId { get; private set; }
        public string UserId { get; private set; }
        public int ScoreValue { get; private set; }

        public Score(string scoreId, string matchId, string userId, int scoreValue)
        {
            ScoreId = scoreId;
            MatchId = matchId;
            UserId = userId;
            ScoreValue = scoreValue;
        }
    }
}
