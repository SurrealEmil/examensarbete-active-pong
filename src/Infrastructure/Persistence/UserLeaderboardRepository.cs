using Domain.DbInterfaces;
using Application.DTOs.UserLeaderboardDTOs;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Domain.Entities;
using Domain.Interfaces;

namespace Infrastructure.Persistence
{
    public class UserLeaderboardRepository : IUserLeaderboardRepository
    {
        private readonly Container _usersContainer;
        private readonly Container _leaderboardsContainer;

        public UserLeaderboardRepository(CosmosClient cosmosClient, ISecretsService secretsService)
        {
            var databaseName = secretsService.GetSecret("CosmosDbDatabaseName");
            _usersContainer = cosmosClient.GetContainer(databaseName, "Users");
            _leaderboardsContainer = cosmosClient.GetContainer(databaseName, "Leaderboards");
        }

        public async Task<UserLeaderboard?> GetUserLeaderboardInfo(string userId)
        {
            // Query Users Container
            var queryUser = new QueryDefinition("SELECT c.Username, c.Email, c.QrCodeIdentifier, c.IsAdmin FROM c WHERE c.UserId = @userId")
                            .WithParameter("@userId", userId);
            var userIterator = _usersContainer.GetItemQueryIterator<dynamic>(queryUser);
            var userResult = await userIterator.ReadNextAsync();
            var user = userResult.FirstOrDefault();

            if (user == null) return null;

            // Query Leaderboards Container to get all game modes for this user
            var queryLeaderboard = new QueryDefinition("SELECT e.GameMode, e.Rank, e.BestScore FROM c JOIN e IN c.Entries WHERE e.UserId = @userId")
                                   .WithParameter("@userId", userId);
            var leaderboardIterator = _leaderboardsContainer.GetItemQueryIterator<dynamic>(queryLeaderboard);

            var gameStats = new List<GameStats>();

            while (leaderboardIterator.HasMoreResults)
            {
                var leaderboardResult = await leaderboardIterator.ReadNextAsync();
                foreach (var entry in leaderboardResult)
                {
                    gameStats.Add(new GameStats
                    {
                        GameMode = entry.GameMode,
                        Rank = entry.Rank,
                        BestScore = entry.BestScore
                    });
                }
            }

            // If no games have been played, add a default entry
            if (!gameStats.Any())
            {
                gameStats.Add(new GameStats
                {
                    GameMode = "No games played yet",
                    Rank = 0,
                    BestScore = 0
                });
            }

            // Merge Results into DTO
            return new UserLeaderboard
            {
                Username = user.Username,
                Email = user.Email,
                QrCodeIdentifier = user.QrCodeIdentifier,
                IsAdmin = user.IsAdmin,
                GameStats = gameStats
            };
        }
    }
}
