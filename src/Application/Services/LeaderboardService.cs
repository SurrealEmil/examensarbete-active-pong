using Application.Interfaces;
using Domain.DbInterfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly ILeaderboardRepository _leaderboardRepository;

        public LeaderboardService(ILeaderboardRepository leaderboardRepository)
        {
            _leaderboardRepository = leaderboardRepository;
        }

        // Submit Score
        public async Task AddEntry(LeaderboardEntry entry)
        {
            await _leaderboardRepository.AddOrUpdateEntry(entry);
        }

        // Get Top 10 Players
        public async Task<List<LeaderboardEntry>> GetTopPlayers(string gameMode)
        {
            return await _leaderboardRepository.GetTopPlayers(gameMode);
        }

        // Get All Players
        public async Task<List<LeaderboardEntry>> GetAllPlayers(string gameMode)
        {
            return await _leaderboardRepository.GetAllPlayers(gameMode);
        }

        // Get Player's Best Score
        public async Task<LeaderboardEntry?> GetPlayerBestScoreAcrossModes(string userId)
        {
            return await _leaderboardRepository.GetPlayerBestScoreAcrossModes(userId);
        }
    }
}
