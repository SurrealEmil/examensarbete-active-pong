using Application.DTOs.LeaderboardDTOs;
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
        Task<LeaderboardEntryDto> AddEntry(string userId, string username, int bestScore, string gameMode);
        Task<List<LeaderboardEntry>> GetTopPlayers(string gameMode);
        Task<List<LeaderboardEntry>> GetAllPlayers(string gameMode);
        Task<LeaderboardEntry?> GetPlayerBestScoreAcrossModes(string userId);
    }
}
