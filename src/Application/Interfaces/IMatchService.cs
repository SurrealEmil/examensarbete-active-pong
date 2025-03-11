using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IMatchService
    {
        Task<Match> CreateMatch(string gameMode, string player1Id, string player1Username);
        Task<Match?> GetMatchById(string matchId);
        Task<List<Match>> GetAllMatches();
        Task<bool> AssignPlayerToMatch(string matchId, string player2Id, string player2Username);
        Task<bool> EndMatch(string matchId, string winnerId);
        Task<bool> DeleteMatch(string matchId);
    }
}
