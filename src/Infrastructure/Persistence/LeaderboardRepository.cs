using Domain.Entities;
using Domain.DbInterfaces;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence
{
    public class LeaderboardRepository : ILeaderboardRepository
    {
        private readonly Container _container;

        public LeaderboardRepository(CosmosClient cosmosClient)
        {
            _container = cosmosClient.GetContainer("PongGameDB", "Leaderboards");
        }

        // Add a new entry or update existing one
        public async Task AddOrUpdateEntry(LeaderboardEntry entry)
        {
            var leaderboard = await GetLeaderboardByGameMode(entry.GameMode);

            if (leaderboard == null)
            {
                leaderboard = new Leaderboard(entry.GameMode, new List<LeaderboardEntry> { entry });
            }
            else
            {
                var existingEntry = leaderboard.Entries.FirstOrDefault(e => e.UserId == entry.UserId);

                if (existingEntry == null)
                    leaderboard.Entries.Add(entry);
                else if (entry.BestScore > existingEntry.BestScore)
                    existingEntry.UpdateScore(entry.BestScore); // Update best score

                // Sort and update ranks within the existing list
                var sortedEntries = leaderboard.Entries.OrderByDescending(e => e.BestScore)
                    .Select((e, i) =>
                    {
                        e.UpdateRank(i + 1);
                        return e;
                    })
                    .ToList();

                leaderboard.Entries.Clear();
                leaderboard.Entries.AddRange(sortedEntries);
            }

            await _container.UpsertItemAsync(leaderboard, new PartitionKey(leaderboard.GameMode));
        }

        // Get Top 10 Players for a game mode
        public async Task<List<LeaderboardEntry>> GetTopPlayers(string gameMode)
        {
            var leaderboard = await GetLeaderboardByGameMode(gameMode);
            return leaderboard?.Entries.Take(10).ToList() ?? new List<LeaderboardEntry>();
        }

        // Get Player's Best Score Across All Modes
        public async Task<LeaderboardEntry?> GetPlayerBestScoreAcrossModes(string userId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE ARRAY_CONTAINS(c.TopPlayers, { 'UserId': @userId })")
                        .WithParameter("@userId", userId);

            var iterator = _container.GetItemQueryIterator<Leaderboard>(query);

            // Provide a default GameMode to satisfy the constructor
            var bestEntry = new LeaderboardEntry(userId, "", 0, 0, "Unknown");

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                foreach (var leaderboard in response)
                {
                    var playerEntry = leaderboard.Entries.FirstOrDefault(p => p.UserId == userId);
                    if (playerEntry != null && playerEntry.BestScore > bestEntry.BestScore)
                        bestEntry = playerEntry;
                }
            }

            return bestEntry.BestScore > 0 ? bestEntry : null;
        }


        private async Task<Leaderboard?> GetLeaderboardByGameMode(string gameMode)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.id = @gameMode")
                        .WithParameter("@gameMode", gameMode);

            var iterator = _container.GetItemQueryIterator<Leaderboard>(query);
            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
            }

            return null;
        }
    }
}
