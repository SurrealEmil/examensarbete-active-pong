using Domain.DbInterfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService
    {
        private readonly ICosmosDbService _cosmosDbService;

        public UserService(ICosmosDbService cosmosDbService)
        {
            _cosmosDbService = cosmosDbService;
        }

        public async Task CreateUserAsync(User user)
        {
            await _cosmosDbService.AddItemAsync(user);
        }

        public async Task<User?> GetUserAsync(string userId)
        {
            return await _cosmosDbService.GetItemAsync<User>(userId);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _cosmosDbService.GetAllItemsAsync<User>();
        }
    }
}
