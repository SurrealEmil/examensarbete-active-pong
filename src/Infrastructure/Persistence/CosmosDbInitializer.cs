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
            _logger.LogInformation($"Creating database: {databaseName} with shared throughput if it doesn't exist...");
            Database database = (await _cosmosClient.CreateDatabaseIfNotExistsAsync(databaseName, throughput: 400)).Database;
            _logger.LogInformation($"Database {database.Id} is ready.");

            // Create containers
            await CreateContainer(database, "Users", "/UserId");
            await CreateContainer(database, "Leaderboards", "/LeaderboardId");

            _logger.LogInformation("All required containers are ready.");

            // Seed Users & Leaderboards
            await SeedUsersAndLeaderboard(database);
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
            _logger.LogInformation($"Creating container: {containerName} with partition key {partitionKey}...");
            var response = await database.CreateContainerIfNotExistsAsync(new ContainerProperties(containerName, partitionKey));
            _logger.LogInformation($"Container {response.Container.Id} is ready.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating container {containerName}: {ex.Message}");
        }
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

        var users = new List<Domain.Entities.User>();
        var leaderboardEntries = new List<LeaderboardEntry>();

        _logger.LogInformation("Seeding users and leaderboard data...");

        for (int i = 0; i < usernames.Count; i++)
        {
            string userId = Guid.NewGuid().ToString();
            string username = usernames[i];
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

        // Insert Users into CosmosDB
        foreach (var user in users)
        {
            await usersContainer.UpsertItemAsync(user, new PartitionKey(user.UserId));
        }

        // Insert Leaderboard Entries into CosmosDB **(Sorting + Rank Fix)**
        foreach (var gameMode in gameModes)
        {
            var sortedEntries = leaderboardEntries
                .Where(e => e.GameMode == gameMode)
                .OrderByDescending(e => e.BestScore) // Sort scores highest to lowest
                .Select((entry, index) =>
                {
                    entry.UpdateRank(index + 1); // Assign correct rank
                    return entry;
                })
                .ToList();

            var leaderboard = new Leaderboard(gameMode, sortedEntries);
            await leaderboardsContainer.UpsertItemAsync(leaderboard, new PartitionKey(gameMode));
        }

        _logger.LogInformation("Seeding Complete: 11 Users & Leaderboard Scores Added with Correct Rankings.");
    }

}
