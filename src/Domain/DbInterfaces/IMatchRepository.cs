using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DbInterfaces
{
    public interface IMatchRepository
    {
        Task<Match?> GetMatchById(string matchId);
        Task<List<Match>> GetAllMatches();
        Task AddMatch(Match match);
        Task<bool> UpdateMatch(Match match);
        Task<bool> DeleteMatch(string matchId);
    }
}
