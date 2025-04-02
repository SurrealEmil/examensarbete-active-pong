using Domain.Entities;
using Domain.DbInterfaces;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using Infrastructure.SignalR;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Persistence
{
    public class LeaderboardRepository : ILeaderboardRepository
    {
        private readonly Container _container;
        private readonly IHubContext<LeaderboardHub> _hubContext;

        public LeaderboardRepository(CosmosClient cosmosClient, IHubContext<LeaderboardHub> hubContext)
        {
            _container = cosmosClient.GetContainer("PongGameDB", "Leaderboards");
            _hubContext = hubContext;
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

            // Notify all clients about leaderboard updates
            await _hubContext.Clients.All.SendAsync("ReceiveLeaderboardUpdate");
        }

        // Get Top 10 Players for a game mode
        public async Task<List<LeaderboardEntry>> GetTopPlayers(string gameMode)
        {
            var leaderboard = await GetLeaderboardByGameMode(gameMode);
            return leaderboard?.Entries.Take(10).ToList() ?? new List<LeaderboardEntry>();
        }

        public async Task<List<LeaderboardEntry>> GetAllPlayers(string gameMode)
        {
            var leaderboard = await GetLeaderboardByGameMode(gameMode);
            return leaderboard?.Entries.ToList() ?? new List<LeaderboardEntry>();
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
        public async Task DeleteEntry(string userId, string gameMode)
        {
            // Fetch the leaderboard document for the given gameMode
            var leaderboard = await GetLeaderboardByGameMode(gameMode);
            if (leaderboard == null)
            {
                // No leaderboard found, nothing to delete
                return;
            }

            // Find the existing entry
            var existingEntry = leaderboard.Entries.FirstOrDefault(e => e.UserId == userId);
            if (existingEntry == null)
            {
                // The user doesn't exist in this leaderboard
                return;
            }

            // Remove the user’s entry
            leaderboard.Entries.Remove(existingEntry);

            // Re-sort the entries by score and update ranks
            var sortedEntries = leaderboard.Entries
                .OrderByDescending(e => e.BestScore)
                .Select((entry, index) =>
                {
                    // index is zero-based; rank is one-based
                    entry.UpdateRank(index + 1);
                    return entry;
                })
                .ToList();

            // Replace the old list with the newly sorted list
            leaderboard.Entries.Clear();
            leaderboard.Entries.AddRange(sortedEntries);

            // Upsert the updated leaderboard back into Cosmos DB
            await _container.UpsertItemAsync(leaderboard, new PartitionKey(leaderboard.GameMode));

            // Notify all SignalR clients that the leaderboard changed
            await _hubContext.Clients.All.SendAsync("ReceiveLeaderboardUpdate");
        }
    }
}
