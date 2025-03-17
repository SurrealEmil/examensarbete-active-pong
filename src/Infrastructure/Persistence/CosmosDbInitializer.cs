using Application.DTOs.UserDTOs;
using Domain.Entities;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class CosmosDbInitializer
{
    private readonly CosmosClient _cosmosClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CosmosDbInitializer> _logger;

    public CosmosDbInitializer(CosmosClient cosmosClient, IConfiguration configuration, ILogger<CosmosDbInitializer> logger)
    {
        _cosmosClient = cosmosClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        var databaseName = _configuration["CosmosDb:DatabaseName"];
        if (string.IsNullOrEmpty(databaseName))
        {
            _logger.LogError("CosmosDB database name is not configured.");
            return;
        }

        try
        {
            _logger.LogInformation($"Creating database: {databaseName} if it doesn't exist...");
            Database database = (await _cosmosClient.CreateDatabaseIfNotExistsAsync(databaseName, throughput: 400)).Database;
            _logger.LogInformation($"Database {database.Id} is ready.");

            // Create necessary containers
            await CreateContainer(database, "Users", "/UserId");
            await CreateContainer(database, "Leaderboards", "/LeaderboardId");

            _logger.LogInformation("All required containers are ready.");

            // Check if the database is empty before seeding
            bool isEmpty = await IsDatabaseEmpty(database);
            if (isEmpty)
            {
                await SeedUsersAndLeaderboard(database);
            }
            else
            {
                _logger.LogInformation("Database is not empty. Skipping seeding.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error initializing CosmosDB: {ex.Message}");
        }
    }

    private async Task CreateContainer(Database database, string containerName, string partitionKey)
    {
        try
        {
            _logger.LogInformation($"Creating container: {containerName}...");
            var response = await database.CreateContainerIfNotExistsAsync(new ContainerProperties(containerName, partitionKey));
            _logger.LogInformation($"Container {response.Container.Id} is ready.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating container {containerName}: {ex.Message}");
        }
    }

    private async Task<bool> IsDatabaseEmpty(Database database)
    {
        var usersContainer = database.GetContainer("Users");
        var leaderboardsContainer = database.GetContainer("Leaderboards");

        bool usersEmpty = await IsContainerEmpty(usersContainer);
        bool leaderboardsEmpty = await IsContainerEmpty(leaderboardsContainer);

        return usersEmpty && leaderboardsEmpty;
    }

    private async Task<bool> IsContainerEmpty(Container container)
    {
        var query = new QueryDefinition("SELECT VALUE COUNT(1) FROM c");
        using var iterator = container.GetItemQueryIterator<int>(query);
        if (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            return response.FirstOrDefault() == 0; // Returns true if count is 0
        }
        return true; // Default to empty if unable to retrieve data
    }

    private async Task SeedUsersAndLeaderboard(Database database)
    {
        var usersContainer = database.GetContainer("Users");
        var leaderboardsContainer = database.GetContainer("Leaderboards");

        var random = new Random();
        var gameModes = new List<string> { "Pong", "Arcade", "Party" };
        var usernames = new List<string>
        {
            "PlayerOne", "ShadowHunter", "ArcadeKing", "PongMaster", "NightFury",
            "QuickSilver", "StormBreaker", "NeonNinja", "ZeroGravity", "CodeWarrior", "YourMove"
        };

        _logger.LogInformation("Seeding users and leaderboard data...");

        var users = new List<Domain.Entities.User>();
        var leaderboardEntries = new List<LeaderboardEntry>();

        foreach (var username in usernames)
        {
            string userId = Guid.NewGuid().ToString();
            string email = $"{username.ToLower()}@example.com";
            string qrCodeIdentifier = random.Next(100000, 999999).ToString();

            var user = new Domain.Entities.User(userId, username, email, qrCodeIdentifier, false);
            users.Add(user);

            foreach (var gameMode in gameModes)
            {
                int score = random.Next(1000, 10000);
                leaderboardEntries.Add(new LeaderboardEntry(userId, username, score, 0, gameMode));
            }
        }

        // **Insert Users into CosmosDB**
        foreach (var user in users)
        {
            await usersContainer.UpsertItemAsync(user, new PartitionKey(user.UserId));
        }

        // **Insert or Update Leaderboard Entries**
        foreach (var gameMode in gameModes)
        {
            var sortedEntries = leaderboardEntries
                .Where(e => e.GameMode == gameMode)
                .OrderByDescending(e => e.BestScore)
                .Select((entry, index) =>
                {
                    entry.UpdateRank(index + 1);
                    return entry;
                })
                .ToList();

            var leaderboard = new Leaderboard(gameMode, sortedEntries);
            await leaderboardsContainer.UpsertItemAsync(leaderboard, new PartitionKey(gameMode));
        }

        _logger.LogInformation("Seeding Complete: 11 Users & Leaderboard Scores Added.");
    }
}
