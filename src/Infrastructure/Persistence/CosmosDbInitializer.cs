using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence
{
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
                Database database = (await _cosmosClient.CreateDatabaseIfNotExistsAsync(databaseName, throughput: 400)).Database; // Shared throughput at DB level
                _logger.LogInformation($"Database {database.Id} is ready.");

                // ✅ Create containers without specifying throughput (they use shared throughput)
                await CreateContainer(database, "Users", "/UserId");
                await CreateContainer(database, "Leaderboards", "/LeaderboardId");

                _logger.LogInformation("All required containers are ready.");
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
    }
}
