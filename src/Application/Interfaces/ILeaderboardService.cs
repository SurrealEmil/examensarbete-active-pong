using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ILeaderboardService
    {
        Task AddEntry(LeaderboardEntry entry);
        Task<List<LeaderboardEntry>> GetTopPlayers(string gameMode);
        Task<LeaderboardEntry?> GetPlayerBestScoreAcrossModes(string userId);
    }
}
