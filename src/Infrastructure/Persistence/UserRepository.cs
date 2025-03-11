using Microsoft.Azure.Cosmos;
using Domain.DbInterfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    internal class UserRepository : IUserRepository
    {
        private readonly CosmosClient _cosmosClient;
        private readonly Container _container;

        public UserRepository(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
            _container = _cosmosClient.GetContainer("PongGameDB", "Users");
        }

        public async Task<Domain.Entities.User?> GetUserById(string userId)
        {
            try
            {
                var response = await _container.ReadItemAsync<Domain.Entities.User>(userId, new PartitionKey(userId));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<List<Domain.Entities.User>> GetAllUsers()
        {
            var query = new QueryDefinition("SELECT * FROM c");
            using FeedIterator<Domain.Entities.User> resultSet = _container.GetItemQueryIterator<Domain.Entities.User>(query);
            List<Domain.Entities.User> users = new List<Domain.Entities.User>();

            while (resultSet.HasMoreResults)
            {
                var response = await resultSet.ReadNextAsync();
                users.AddRange(response);
            }

            return users;
        }

        public async Task AddUser(Domain.Entities.User user)
        {
            await _container.CreateItemAsync(user, new PartitionKey(user.PartitionKey));
        }

        public async Task DeleteUser(string userId)
        {
            await _container.DeleteItemAsync<Domain.Entities.User>(userId, new PartitionKey(userId));
        }

        public async Task<bool> UserExists(string userId)
        {
            return await GetUserById(userId) != null;
        }

        public async Task<bool> QrCodeExists(int qrCode)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.QrCodeIdentifier = @qrCode")
                .WithParameter("@qrCode", qrCode);

            using FeedIterator<Domain.Entities.User> resultSet = _container.GetItemQueryIterator<Domain.Entities.User>(query);

            while (resultSet.HasMoreResults) // Await query execution
            {
                var response = await resultSet.ReadNextAsync();
                if (response.Any()) // If any results exist, return true
                    return true;
            }

            return false; // If no matches were found, return false
        }

    }
}
