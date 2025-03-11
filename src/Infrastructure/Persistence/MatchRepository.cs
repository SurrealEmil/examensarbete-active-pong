using Domain.DbInterfaces;
using Domain.Entities;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence
{
    public class MatchRepository : IMatchRepository
    {
        private readonly CosmosClient _cosmosClient;
        private readonly Container _container;

        public MatchRepository(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
            _container = _cosmosClient.GetContainer("PongGameDB", "Matches");
        }

        public async Task AddMatch(Match match)
        {
            await _container.CreateItemAsync(match, new PartitionKey(match.MatchId));
        }

        public async Task<bool> DeleteMatch(string matchId)
        {
            try
            {
                await _container.DeleteItemAsync<Match>(matchId, new PartitionKey(matchId));
                return true;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        public async Task<List<Match>> GetAllMatches()
        {
            var query = new QueryDefinition("SELECT * FROM c");
            var iterator = _container.GetItemQueryIterator<Match>(query);
            var matches = new List<Match>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                matches.AddRange(response);
            }

            return matches;
        }

        public async Task<Match?> GetMatchById(string matchId)
        {
            try
            {
                var response = await _container.ReadItemAsync<Match>(matchId, new PartitionKey(matchId));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<bool> UpdateMatch(Match match)
        {
            try
            {
                await _container.UpsertItemAsync(match, new PartitionKey(match.MatchId));
                return true;
            }
            catch (CosmosException)
            {
                return false;
            }
        }
    }
}
