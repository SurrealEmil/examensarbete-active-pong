//using Microsoft.Azure.Cosmos;
//using Domain.DbInterfaces;
//using Domain.Entities;

//namespace Infrastructure.Persistence
//{
//    public class CosmosDbService : ICosmosDbService
//    {
//        private readonly CosmosClient _cosmosClient;
//        private readonly Database _database;
//        private readonly Dictionary<string, Container> _containers;

//        public CosmosDbService(CosmosClient cosmosClient)
//        {
//            _cosmosClient = cosmosClient;
//            _database = _cosmosClient.GetDatabase("PongGameDB");

//            _containers = new Dictionary<string, Container>
//            {
//                { "Users", _database.GetContainer("Users") },
//                { "Matches", _database.GetContainer("Matches") },
//                { "Scores", _database.GetContainer("Scores") },
//                { "GameModes", _database.GetContainer("GameModes") },
//                { "Leaderboards", _database.GetContainer("Leaderboards") }
//            };
//        }

//        public async Task<T?> GetItemAsync<T>(string id)
//        {
//            string containerName = GetContainerName<T>();
//            if (!_containers.ContainsKey(containerName)) return default;

//            try
//            {
//                var response = await _containers[containerName].ReadItemAsync<T>(id, new PartitionKey(id));
//                return response.Resource;
//            }
//            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
//            {
//                return default;
//            }
//        }

//        public async Task<List<T>> GetAllItemsAsync<T>()
//        {
//            string containerName = GetContainerName<T>();
//            if (!_containers.ContainsKey(containerName)) return new List<T>();

//            var query = new QueryDefinition("SELECT * FROM c");
//            using FeedIterator<T> resultSet = _containers[containerName].GetItemQueryIterator<T>(query);
//            List<T> results = new List<T>();

//            while (resultSet.HasMoreResults)
//            {
//                var response = await resultSet.ReadNextAsync();
//                results.AddRange(response);
//            }

//            return results;
//        }

//        public async Task AddItemAsync<T>(T item)
//        {
//            string containerName = GetContainerName<T>();
//            if (!_containers.ContainsKey(containerName)) return;

//            string partitionKey = GetPartitionKey(item);
//            await _containers[containerName].CreateItemAsync(item, new PartitionKey(partitionKey));
//        }

//        public async Task DeleteItemAsync<T>(string id)
//        {
//            string containerName = GetContainerName<T>();
//            if (!_containers.ContainsKey(containerName)) return;

//            await _containers[containerName].DeleteItemAsync<T>(id, new PartitionKey(id));
//        }

//        private string GetContainerName<T>()
//        {
//            return typeof(T).Name switch
//            {
//                "User" => "Users",
//                "Match" => "Matches",
//                "Score" => "Scores",
//                "GameMode" => "GameModes",
//                "Leaderboard" => "Leaderboards",
//                _ => throw new Exception($"Unknown container for type {typeof(T).Name}")
//            };
//        }

//        private string GetPartitionKey<T>(T item)
//        {
//            return item switch
//            {
//                Domain.Entities.User u => u.UserId,
//                Match m => m.MatchId,
//                Score s => s.MatchId,
//                GameMode g => g.GameModeId,
//                Leaderboard l => l.GameModeId,
//                _ => throw new Exception($"Unknown partition key for type {typeof(T).Name}")
//            };
//        }
//    }
//}
