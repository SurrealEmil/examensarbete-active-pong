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
    public class MatchService : IMatchService
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IUserRepository _userRepository;

        public MatchService(IMatchRepository matchRepository, IUserRepository userRepository)
        {
            _matchRepository = matchRepository;
            _userRepository = userRepository;
        }

        public async Task<Match> CreateMatch(string gameMode, string player1Id, string player1Username)
        {
            var matchId = Guid.NewGuid().ToString();
            var player1Info = new PlayerInfo(player1Id, player1Username);
            var match = new Match(matchId, gameMode, player1Info, DateTime.UtcNow);

            await _matchRepository.AddMatch(match);
            return match;
        }

        public async Task<bool> AssignPlayerToMatch(string matchId, string player2Id, string player2Username)
        {
            var match = await _matchRepository.GetMatchById(matchId);
            if (match == null || match.Player2 != null) return false; // ❌ Match not found or already full

            if (match.Player1.UserId == player2Id) return false; // ❌ Prevent Player 1 from joining twice

            match.AssignPlayer2(new PlayerInfo(player2Id, player2Username));
            return await _matchRepository.UpdateMatch(match); // Save changes to DB
        }


        public async Task<bool> EndMatch(string matchId, string winnerId)
        {
            var match = await _matchRepository.GetMatchById(matchId);
            if (match == null || match.WinnerId != null) return false; // Match not found or already ended

            match.EndMatch(winnerId);
            return await _matchRepository.UpdateMatch(match);
        }

        public async Task<bool> DeleteMatch(string matchId)
        {
            return await _matchRepository.DeleteMatch(matchId);
        }

        public async Task<List<Match>> GetAllMatches()
        {
            return await _matchRepository.GetAllMatches();
        }

        public async Task<Match?> GetMatchById(string matchId)
        {
            return await _matchRepository.GetMatchById(matchId);
        }
    }
}
