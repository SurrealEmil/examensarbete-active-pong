using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DbInterfaces
{
    public interface ILeaderboardRepository
    {
        Task AddOrUpdateEntry(LeaderboardEntry entry);
        Task<List<LeaderboardEntry>> GetTopPlayers(string gameMode);
        Task<List<LeaderboardEntry>> GetAllPlayers(string gameMode);
        Task<LeaderboardEntry?> GetPlayerBestScoreAcrossModes(string userId);
    }
}
