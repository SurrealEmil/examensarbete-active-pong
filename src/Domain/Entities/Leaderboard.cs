using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Entities
{
    public class Leaderboard
    {
        [JsonProperty("id")]
        public string LeaderboardId { get; private set; } // Required for CosmosDB

        [JsonProperty("GameMode")]
        public string PartitionKey => GameMode;  // GameMode as partition key

        public string GameMode { get; private set; } // Each leaderboard is for a specific game mode
        public List<LeaderboardEntry> Entries { get; private set; }

        public Leaderboard(string gameMode, List<LeaderboardEntry> entries)
        {
            LeaderboardId = gameMode;
            GameMode = gameMode;
            Entries = entries ?? new List<LeaderboardEntry>(); // Use existing list or initialize a new one
        }

        public void AddOrUpdateEntry(string userId, string username, int score)
        {
            var existingEntry = Entries.FirstOrDefault(e => e.UserId == userId);

            if (existingEntry != null)
            {
                existingEntry.UpdateScore(score); // Update only if score is better
            }
            else
            {
                Entries.Add(new LeaderboardEntry(userId, username, score, 0, GameMode));
            }

            RecalculateRanks(); // Re-rank after updating scores
        }

        private void RecalculateRanks()
        {
            Entries = Entries.OrderByDescending(e => e.BestScore).ToList(); // Sort leaderboard by best score
            for (int i = 0; i < Entries.Count; i++)
            {
                Entries[i].UpdateRank(i + 1); // Assign new rank (1-based index)
            }
        }
    }
}
