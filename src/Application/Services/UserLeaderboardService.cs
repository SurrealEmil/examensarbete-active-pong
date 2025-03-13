using Application.Interfaces;
using Domain.DbInterfaces;
using Application.DTOs.UserLeaderboardDTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserLeaderboardService : IUserLeaderboardService
    {
        private readonly IUserLeaderboardRepository _userLeaderboardRepository;

        public UserLeaderboardService(IUserLeaderboardRepository userLeaderboardRepository)
        {
            _userLeaderboardRepository = userLeaderboardRepository;
        }

        public async Task<UserLeaderboardDto?> GetUserLeaderboardInfo(string userId)
        {
            var userLeaderboard = await _userLeaderboardRepository.GetUserLeaderboardInfo(userId);
            if (userLeaderboard == null) return null;

            return new UserLeaderboardDto(userLeaderboard);
        }
    }
}
